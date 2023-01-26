import fetch from 'node-fetch'
import nodemailer from 'nodemailer'

const results = []

// function to send email
const sendEmail = (balance) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-password'
        }
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: 'recipient-email@gmail.com',
        subject: 'ETH balance alert',
        text: `The ETH balance for the address has dropped below 0.1 ETH. Current balance: ${balance} ETH`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function checkBalance() {
    const startTime = Date.now()

    const data = {
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: ["0x256144a60f34288F7b03D345F8Cb256C502e0f2C", "latest"],
        id: 1
    };

    fetch("https://goerli.infura.io/v3/f1b3db65ecfb4360acd83ba9eceb61d9", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            const endTime = Date.now()
            const responseTime = endTime - startTime
            console.log(`Response time: ${responseTime}ms`)

            const statusCode = response.status
            console.log(`Response code: ${statusCode}`)

            results.push({
                responseTime,
                statusCode
            })

            return response.json()
        })
        .then(response => {
            const resultInHex = response.result;
            const resultInDecimal = parseInt(resultInHex, 16);
            const resultInETH = resultInDecimal / Math.pow(10, 18);
            console.log('The address holds ' + resultInETH + ' ETH \n');
            if (resultInETH < 0.1) {
                sendEmail(resultInETH);
            }
        })
        .catch(error => console.error(error));
}

setInterval(checkBalance, 5000); // check every 5 seconds

setTimeout(() => {
    console.table(results)
}, 5000) // print results after 5 seconds
