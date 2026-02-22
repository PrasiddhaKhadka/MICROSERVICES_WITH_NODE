import { kafka } from "./client.js"
import nodemailer from 'nodemailer';

export const startSendMailConsumer = async () => {
    try {
        const consumer = kafka.consumer({
            groupId: 'mail-service-group'
        })

        await consumer.connect()

        const topicName = 'send-mail'

        await consumer.subscribe({
            topic: topicName,
            fromBeginning: false,
        })

        console.log('🔥Mail Service consumer started listening for sending mail')

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const { to, subject, html } = JSON.parse(message.value?.toString() || '{}')

                    if (!to || !subject || !html) {
                        console.error('❌ Missing required fields: to, subject, or html')
                        return
                    }

                    const transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465,
                        secure: true,
                        auth: {
                            user: process.env.SMTP_USER || '',
                            pass: process.env.SMTP_PASS || '',
                        }
                    })

                    await transporter.verify()

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
