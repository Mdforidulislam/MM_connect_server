
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

export const sendEmailWithSendGrid = async ({to, subject, text, htmlContent}:{to: string, subject: string, text: string, htmlContent: string}) => {
                        try {
                            const msg = {
                                    to: to, 
                                    from: process.env.EMAIL_SEND_GRID as string,
                                    subject: subject,
                                    text: text,
                                    html: htmlContent
                                    }
                                    sgMail
                                    .send(msg)
                                    .then((data: any) => {
                                        console.log('Email sent')
                                    })
                                    .catch((error: any) => {
                                        console.error('checking error here ======>',error)
                                    })
    } catch (error) {
 
        console.log(error,'error here');
    }
}


