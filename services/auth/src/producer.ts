import { kafka } from "./client.js";
import { Admin, Producer} from "kafkajs"


let producer:Producer
let admin: Admin


export const connectKafka = async()=>{
    try {
        admin = kafka.admin()
        await admin.connect()
        
        const topics = await admin.listTopics()

        if(!topics.includes('send-mail')){

            await admin.createTopics({
                topics:[
                    {
                        topic:"send-mail",
                        numPartitions:1,
                        replicationFactor:1,
                    }
                ]

            });
            console.log("🔥 Topic 'send-mail' created .....")

        }

        await admin.disconnect()

        producer = kafka.producer()

        await producer.connect()

        console.log('🔥 Connected to Kafka Producer')

    } catch (error) {
        
        console.log('Failed to connect to Kafka',error)

    }
}


export const publishToTopic = async(topic:string, message:any)=>{
        
        if(!producer){
            console.log('Kafka Producer is not Initialized')
            return;
        }

    try {
        
        await producer.send({
            topic:topic,
            messages:[
                {
                    value:JSON.stringify(message)
                }
            ]
        })
    } catch (error) {
        console.log('Failed to Publish message to kafka')
    }


}


export const disconnectKafka = async()=>{
    if(producer){
        producer.disconnect();
    }
};