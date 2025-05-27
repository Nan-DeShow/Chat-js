const { connect, StringCodec } = require('nats');

const messageStates = {
    Messaging: 'Messaging',
    Waiting: 'Waiting',
}


async function sendMessage(nc, topic, message) {
    const sc = StringCodec();
    try {
        // Encode and publish the message
        nc.publish(topic, sc.encode(message));
        console.log(`Sent message on ${topic}: ${message}`);
    } catch (err) {
        console.error(`Error sending message: ${err}`);
    }
}

async function messageHandler(sc, topic, message) {
    try {
        // Decode the incoming message
        const decodedMessage = sc.decode(message);
        console.log(`Received message on ${topic}: ${decodedMessage}`);

        // Simulate processing the message
        if (sendMessage(decodedMessage)) {
            console.log(`Processing message: ${decodedMessage}`);
            // Simulate a successful processing state
            return messageStates.Messaging;
        } else {
            console.log(`Waiting for valid message: ${decodedMessage}`);
            return messageStates.Waiting;
        }
    } catch (err) {
        return messageStates.Waiting;
    }
}

async function main() {
    try {
        // Connect to NATS
        const nc = await connect({ servers: 'nats://192.168.1.207:4222' });
        console.log('Connected to NATS');
        const topic = 'example.topic';
        const subscription = nc.subscribe(topic);

        // Create a codec for string encoding/decoding
        const sc = StringCodec();

    (async () => {
        for await (const m of subscription) {
            console.log(`Received message: ${sc.decode(m.data)}`);
        }
    })();

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
            console.log(`Message state: ${state}`);

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