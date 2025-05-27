const { connect, StringCodec } = require('nats');

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
            console.log(`Received message on ${topic}: ${sc.decode(m.data)}`);
        }
    })();

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