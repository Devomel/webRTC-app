/* eslint-disable @typescript-eslint/no-unused-vars */
import { changeLanguage } from "i18next";
import * as mediasoupClient from "mediasoup-client"
import { useRef } from "react";
import { io } from "socket.io-client";

const containerStyle: React.CSSProperties = {
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   padding: "20px",
};

const videoContainerStyle: React.CSSProperties = {
   display: "flex",
   justifyContent: "center",
   gap: "20px",
   marginBottom: "10px",
};

const videoBoxStyle: React.CSSProperties = {
   background: "#fde3c2",
   padding: "10px",
   textAlign: "center",
};

const videoStyle: React.CSSProperties = {
   width: "300px",
   height: "200px",
   background: "black",
   display: "block",
   margin: "0 auto",
};

const buttonContainerStyle: React.CSSProperties = {
   marginTop: "10px",
   display: "flex",
   justifyContent: "center",
   gap: "10px",
};

const buttonStyle: React.CSSProperties = {
   padding: "10px",
   cursor: "pointer",
   background: "antiquewhite",
   border: "1px solid black"
};




const Main = () => {
   const localVideoRef = useRef<HTMLVideoElement>(null)
   const remoteVideoRef = useRef<HTMLVideoElement>(null)
   const socket = io("https://192.168.0.104:3000/mediasoup", {

      withCredentials: true
   });
   const params = useRef<any>({
      encodings: [
         { rid: "r0", active: true, maxBitrate: 100000 },
         { rid: "r1", active: true, maxBitrate: 300000 },
         { rid: "r2", active: true, maxBitrate: 900000 }
      ],

      // Специфічні опції для кодека VP8 (можна адаптувати під інші кодеки, якщо потрібно)
      codecOptions: {
         videoGoogleStartBitrate: 1000,
         video: {
            scalabilityMode: 'L1T3', // Масштабованість для VP8
            maxFramerate: 30,        // Максимальна частота кадрів для відео
            maxBitrate: 1000000      // Максимальний бітрейт для відео
         }
      },

      // Інформація про кодек, який буде використовуватися для відео
      codec: {
         mimeType: "video/VP8",    // Тип кодека (можна змінити на "video/VP9" або інший)
         payloadType: 101,         // Payload тип для відео
         clockRate: 90000,         // Частота тактів для відео
         rtcpFeedback: [
            { type: "nack" },
            { type: "nack", parameter: "pli" },
            { type: "ccm", parameter: "fir" },
            { type: "goog-remb" }
         ]
      }
   })
   const rtpCapabilities = useRef<any>()
   const device = useRef<any>()
   const producerTransport = useRef<any>()
   const consumerTransport = useRef<any>()
   const consumer = useRef<any>();
   const producer = useRef<any>();
   socket.on("connection-success", ({ socketId }) => {
      console.log(socketId)
   })

   const streamSuccess = async (stream: MediaStream) => {
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
      const track = stream.getVideoTracks()[0];
      params.current.track = track

   }
   const getLocalVideo = () => {
      navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
         .then(streamSuccess)
         .catch(error => console.log(error.message))
   }
   const getRTPCapabilities = () => {
      socket.emit("getRTPCapabilities", (data: any) => {
         console.log(JSON.stringify(data))
         rtpCapabilities.current = data.rtpCapabilities
      })
   }
   const createDevice = async () => {
      try {
         device.current = new mediasoupClient.Device()
         await device.current.load({
            routerRtpCapabilities: rtpCapabilities.current
         })
         console.log(device.current.rtpCapabilities)
      } catch (error) {
         console.log(error)
      }
   }
   const createSendTransport = () => {
      socket.emit("createWebRtcTransport", { sender: true }, ({ params }) => {
         if (params.error) {
            console.log(params.error)
            return
         }
         console.log(params)
         producerTransport.current = device.current.createSendTransport(params)
         producerTransport.current.on("connect", async ({ dtlsParameters }, callback, errback) => {
            console.log("connect triggered")
            try {
               await socket.emit("transport-connect", {
                  dtlsParameters: dtlsParameters
               })

               callback()
            } catch (error) {
               errback(error)
            }
         })
         producerTransport.current.on("produce", async (parameters, callback, errback) => {
            console.log("connect triggered")

            try {
               await socket.emit("transport-produce", {
                  transportId: producerTransport.current.id,
                  rtpParameters: parameters.rtpParameters,
                  appData: parameters.appData,
                  kind: parameters.kind
               }, ({ id }) => { callback({ id }) })


            } catch (error) {
               errback(error)
            }
         })

      })
   }
   const connectSendTransport = async () => {
      try {
         producer.current = await producerTransport.current.produce(params.current)
         console.log("producer", producer.current)
      } catch (error) {
         console.log(error)
      }
      producer.current.on("trackended", () => {
         console.log("track ended")
      })
      producer.current.on("transportclose", () => {
         console.log("transport ended")
      })
   }
   const createRecieveTransport = async () => {
      await socket.emit("createWebRtcTransport", { sender: false }, ({ params }) => {
         if (params.error) {
            console.log(params.error)
            return
         }
         console.log(params)

         consumerTransport.current = device.current.createRecvTransport(params)


         consumerTransport.current.on("connect", async ({ dtlsParameters }, callback, errback) => {
            console.log("connect triggered")
            try {
               await socket.emit("transport-recv-connect", {
                  dtlsParameters: dtlsParameters
               })

               callback()
            } catch (error) {
               errback(error)
            }
         })
      })
   }
   const connectRecvTransport = async () => {
      console.log(1)
      await socket.emit("consume", { rtpCapabilities: device.current.rtpCapabilities }, async ({ params }) => {
         if (params.error) {
            console.log(params.error)
            return
         }
         console.log(params);
         consumer.current = await consumerTransport.current.consume({
            id: params.id,
            producerId: params.producerId,
            rtpParameters: params.rtpParameters,
            kind: params.kind
         })
         const { track } = consumer.current
         console.log("track", track)
         const remoteStream = new MediaStream();
         remoteStream.addTrack(track);
         console.log("remote stream", remoteStream)
         if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream
            console.log(remoteVideoRef.current.srcObject)
            remoteVideoRef.current?.play().catch(e => console.error("play() error", e))
         }
         socket.emit("consumer-resume")
      })

   }
   return (
      <div style={containerStyle}>
         <div style={videoContainerStyle}>
            <div style={videoBoxStyle}>
               <h3>Local Video</h3>
               <video style={videoStyle} ref={localVideoRef} autoPlay></video>
            </div>
            <div style={videoBoxStyle}>
               <h3>Remote Video</h3>
               <video style={videoStyle} ref={remoteVideoRef} autoPlay playsInline muted></video>
            </div>
         </div>

         <div style={buttonContainerStyle}>
            <button style={buttonStyle} onClick={getLocalVideo} >1. Get Local Video</button>
         </div>
         <div style={buttonContainerStyle}>
            <button style={buttonStyle} onClick={getRTPCapabilities}>2. Get Rtp Capabilities</button>
            <button style={buttonStyle} onClick={createDevice}>3. Create Device</button>
         </div>
         <div style={buttonContainerStyle}>
            <button style={buttonStyle} onClick={createSendTransport}>4. Create Send Transport</button>
            <button style={buttonStyle} onClick={connectSendTransport}>5. Connect Send Transport & Produce</button>
            <button style={buttonStyle} onClick={createRecieveTransport}>6. Create Recv Transport</button>
            <button style={buttonStyle} onClick={connectRecvTransport}>7. Connect Recv Transport & Consume</button>
         </div>
      </div>
   );
};





export default Main