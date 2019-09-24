const sgMail = require('@sendgrid/mail');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const sendWelcomeEmail =  async (email,name) => {
        await sgMail.send({
        to: email,
        from:'emonmazharul@yandex.com',
        subject: 'tnx for joining in',
        text: `Welcome to the app ${name}, Let me know how you get along with the app`,
    })
}


const sendGoneEmail = async (email,name) => {
    await sgMail.send({
        to: email,
        from:'emonmazharul@yandex.com',
        subject: 'why you are leaving us',
        text: `Good bye ${name}. why you are leaving us.do you do any wrong with you ? if you are angry or sad with us please give us your suggestion `
    })
}

module.exports = {
    sendWelcomeEmail,
    sendGoneEmail,
}