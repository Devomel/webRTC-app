import nodemailer from "nodemailer"

class MailService {
  private transporter: ReturnType<typeof nodemailer.createTransport>;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      logger: true,
      debug: true,
      secure: false,
      auth: {
        user: "tranquil.space.info@gmail.com",
        pass: "japz uomp iijz qtfp",
      },
    })
  }
  async sendActivationMail(targetEmail: string, link: string) {
    await this.transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: targetEmail,
      subject: "Активація акаунта на платформі " + process.env.API_URL,
      text: "",
      html:
        `
      <div>
      <h1>
      Для активації перейдіть за посиланням
      </h1>
      <a href="${link}">${link}</a>
      </div>
      `
    })
  }
}
export default new MailService()