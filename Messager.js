const { connect, StringCodec } = require('nats');

const messageStates = {
    Messaging: 'Messaging',
    Waiting: 'Waiting',
}


async function sendMessage(nc, topic, message) {
    const sc = StringCodec();
    try {
        await nc.publish(topic, sc.encode(message));
    } catch (err) {
        console.error(`Error sending message: ${err}`);
    }
}

async function messageHandler(sc, topic, message) {
    try {
        // Decode the incoming message
        const decodedMessage = sc.decode(message);
        console.log(`Processing message: ${decodedMessage}`);
        return messageStates.Messaging;
    } catch (err) {
        console.log(`Error processing message: ${err}`);
        return messageStates.Waiting;
    }
}

async function main() {
    try {
        // Connect to NATS
        const nc = await connect({ servers: 'nats://192.168.1.207:4222' });
        console.log('Connected to NATS');
        const topic = 'example.topic';

        // Create a codec for string encoding/decoding
        const sc = StringCodec();

    while (true) {
        const readline = await import('readline');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        const message = await new Promise(resolve => {
            rl.question("Type your message: ", answer => {
                rl.close();
                resolve(answer);
            });
        });

        if (message) {
            // Handle the message
            const state = await messageHandler(sc, topic, sc.encode(message));
            // Send the message back to the topic
            await sendMessage(nc, topic, message);
        } else {
            console.log('No message entered, exiting...');
            break;
        }
    }

        // Handle application shutdown
        ['SIGINT', 'SIGTERM'].forEach(signal => {
            process.on(signal, async () => {
                await nc.drain();
                process.exit();
            });
        });

    } catch (err) {
        console.error(`Error: ${err}`);
    }
}

main().catch(console.error);