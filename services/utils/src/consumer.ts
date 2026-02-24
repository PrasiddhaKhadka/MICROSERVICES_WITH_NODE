import { kafka } from "./client.js"
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER || 'prasiddhak77@gmail.com',
        pass: process.env.SMTP_PASS || 'tkes jkrq llty cmct',
    }
})

export const startSendMailConsumer = async () => {
    try {

        // ✅ Verify SMTP connection on startup so you catch issues early
        await transporter.verify()
        console.log('✅ SMTP transporter is ready')

        const consumer = kafka.consumer({
            groupId: 'mail-service-group'
        })

        await consumer.connect()

        await consumer.subscribe({
            topic: 'send-mail',
            fromBeginning: true, // ✅ changed to true so missed messages are caught
        })

        console.log('🔥 Mail Service consumer started listening for sending mail')

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const { to, subject, html } = JSON.parse(message.value?.toString() || '{}')

                    if (!to || !subject || !html) {
                        console.error('❌ Missing required fields: to, subject, or html')
                        return
                    }

                    const info = await transporter.sendMail({
                        from: `"No Reply" <${process.env.SMTP_USER}>`,
                        to,
                        subject,
                        html,
                    })

                    console.log(`✅ Email sent to ${to} | Message ID: ${info.messageId}`)

                } catch (error) {
                    console.error('❌ Failed to send email:', error)
                }
            }
        })

    } catch (error) {
        console.error('❌ Mail Service Consumer error:', error)
    }
}