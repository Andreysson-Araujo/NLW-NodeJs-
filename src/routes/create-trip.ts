import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import dayjs from "dayjs"
import { z } from "zod";
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/pt-br'
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer"

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export async function createTrip(app: FastifyInstance) {
  
  app.withTypeProvider<ZodTypeProvider>().post('/trips',{
    schema: {
      body: z.object({
        destination: z.string().min(4),
        starts_at : z.coerce.date(),
        ends_at: z.coerce.date(),
        owner_name: z.string(),
        owner_email: z.string().email(),
        emails_to_invite: z.array(z.string().email())
      })
    }
  } , async (request) =>{
    const {destination, starts_at, ends_at, owner_name, owner_email, emails_to_invite} = request.body

    if (dayjs(starts_at).isBefore(new Date())) {
      throw new Error("Invalid trip start date.")
    }

    if (dayjs(ends_at).isBefore(starts_at)){
      throw new Error("Invalid trip ends date.")
    }

    

    const trip = await prisma.trip.create({
      data: {
        destination,
        starts_at,
        ends_at,
        participant :{
          createMany: {
            data : [
              {
  
                name: owner_name, 
                email: owner_email,
                is_owner: true,
                is_confirmed: true,
              },
              ...emails_to_invite.map(email => {
                return {email}

              })
            ]
          }
        }
      }
    })

    /*
    await prisma.participant.create({
      data: {
        name: owner_name,
        email: owner_email,
        trip_id: trip.id
      }
    })
*/
    const formattedStartDate = dayjs(starts_at).format("LL")
    const formattedEndDate = dayjs(ends_at).format("LL")

    const confirmationLink = `http://localhost:3333/trips/${trip.id}/confirm`

    const mail = await getMailClient()

    const message = await mail.sendMail({
      from: {
        name:"Equip plann.er",
        address: "oi@plann.er",
      },
      to : {
        name: owner_name,
        address: owner_email,
      },
      subject: `Confirme sua viagem para ${destination} em ${formattedStartDate}`,
      html: `
      <div style="font-family:sans-serif; font-size: 16px; line-height: 1.6;">
      <p>Voce solicitou uma viagem para ${destination}</p>
      <p></p>
      <p>para confirmar click no link abaixo</p>
      <p>
        <a href="${confirmationLink}">confirmar</a>
      </p>
    </div>
      `.trim()
    })

    console.log(nodemailer.getTestMessageUrl(message))
    return {
      tripId: trip.id
    }
  })
}