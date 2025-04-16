import * as mediasoup from "mediasoup";
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fs from "fs"
import cookieParser from 'cookie-parser';
import router from './router/index';
import errorMiddleware from './middlewares/error-middleware';
import https from 'https';
import { Server } from 'socket.io';
import { RtpCodecCapability, Worker, Router, WebRtcTransport, Transport, Producer, Consumer } from 'mediasoup/node/lib/types';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const app = express();
const options = {
   key: fs.readFileSync("./api/ssl/key.pem", "utf-8"),
   cert: fs.readFileSync("./api/ssl/cert.pem", "utf-8")
}
const server = https.createServer(options, app);
(() => {
   app.use(express.json());
   app.use(cookieParser());
   app.use(cors({
      origin: "https://localhost:5173",
      credentials: true
   }));
   app.use('/api', router);
   app.use(errorMiddleware);
})()


const io = new Server(server, {
   cors: {
      origin: "https://localhost:5173",
      credentials: true
   }
});

const peers = io.of("/mediasoup")

let worker: Worker;
let mediasoupRouter: Router;

const createWorker = async () => {
   worker = await mediasoup.createWorker({
      rtcMinPort: 2000,
      rtcMaxPort: 2020
   });

   worker.on("died", (error) => {
      console.log("worker has died", error);
      setTimeout(() => process.exit(1), 2000)
   })
   return worker
}

createWorker().then(createdWorker => worker = createdWorker)

const mediaCodecs: RtpCodecCapability[] = [
   {
      kind: "audio",
      mimeType: "audio/opus",
      clockRate: 48000,
      channels: 2
   },
   {
      kind: "video",
      mimeType: "video/VP8",
      clockRate: 90000,
      parameters: {
         "x-google-start-bitrate": 1000
      }
   }
]

let producerTransport: WebRtcTransport | undefined;
let consumerTransport: WebRtcTransport | undefined;
let producer: Producer | undefined;
let consumer: Consumer | undefined;

peers.on("connection", async (socket) => {
   console.log(socket.id);
   socket.emit("connection-success", {
      socketId: socket.id
   });

   socket.on("disconnect", () => {
      console.log("user disconnected");
   });

   mediasoupRouter = await worker.createRouter({ mediaCodecs });

   socket.on("getRTPCapabilities", (callback) => {
      const rtpCapabilities = mediasoupRouter.rtpCapabilities;
      callback({ rtpCapabilities });
   });

   socket.on("createWebRtcTransport", async ({ sender }, callback) => {
      try {
         const transport = await createMediasoupTransport(callback);
         if (sender) {
            producerTransport = transport;
         } else {
            consumerTransport = transport;
         }
      } catch (error) {
         console.error("Error creating WebRTC transport:", error);
      }
   });

   socket.on("transport-connect", async ({ dtlsParameters }) => {
      try {
         console.log("dtlsParam:", { dtlsParameters });
         await producerTransport?.connect({ dtlsParameters });
      } catch (error) {
         console.error("Error connecting producer transport:", error);
      }
   });

   socket.on("transport-recv-connect", async ({ dtlsParameters }) => {
      try {
         console.log("dtlsParam:", { dtlsParameters });
         await consumerTransport?.connect({ dtlsParameters });
      } catch (error) {
         console.error("Error connecting consumer transport:", error);
      }
   });

   socket.on("transport-produce", async ({ kind, rtpParameters }, callback) => {
      try {
         producer = await producerTransport!.produce({
            kind,
            rtpParameters
         });

         console.log("Producer Id:", kind, rtpParameters);

         producer?.on("transportclose", () => {
            console.log("transport for this producer closed");
            producer?.close();
         });

         callback({
            id: producer?.id,
         });
      } catch (error) {
         console.log("server error on transport-produce", error);
      }
   });

   socket.on("consume", async ({ rtpCapabilities }, callback) => {
      try {
         if (!consumerTransport || !producer) {
            console.error("Producer transport or consumer transport not found");
            return;
         }

         if (mediasoupRouter.canConsume({ producerId: producer.id, rtpCapabilities })) {
            console.log("canConsume");
            consumer = await consumerTransport.consume({
               paused: true,
               rtpCapabilities,
               producerId: producer.id
            });

            consumer?.on("transportclose", () => {
               console.log("transport closed from consumer");
               producer?.close();
            });

            consumer?.on("producerclose", () => {
               console.log("producerclose");
            });

            const params = {
               id: consumer?.id,
               producerId: producer.id,
               kind: consumer?.kind,
               rtpParameters: consumer?.rtpParameters
            };
            callback({ params });
         }
      } catch (error) {
         console.log(error);
         callback({
            params: {
               error: error
            }
         });
      }
   });

   socket.on("consumer-resume", async () => {
      try {
         await consumer?.resume();
      } catch (error) {
         console.error("Error resuming consumer:", error);
      }
   });
});

const createMediasoupTransport = async (callback: any) => {
   try {
      const webRtcTransport_options = {
         listenIps: [{
            ip: "0.0.0.0",                  // слухати на всіх інтерфейсах
            announcedIp: "192.168.0.104"  // сюди вставляєш публічну IP-адресу сервера
         }],
         enabledUdp: true,
         enabledTcp: true,
         preferUdp: true,
      }
      let transport = await mediasoupRouter.createWebRtcTransport(webRtcTransport_options)
      transport.on("dtlsstatechange", (dtlsState) => {
         if (dtlsState === "closed") transport.close()
      })
      transport.on("@close", () => {
         console.log("transport closed")
      })
      callback({
         params: {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters
         }
      })
      return transport
   } catch (error) {
      callback({ params: { error: error } })
   }
}
const start = async () => {
   try {
      server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
   } catch (e) {
      console.error(e);
   }
};

start();
