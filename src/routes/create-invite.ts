import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {dayjs} from "../lib/dayjs"
import { z } from "zod";
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/pt-br'
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer"

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export async function createInvite(app: FastifyInstance) {
  
  app.withTypeProvider<ZodTypeProvider>().post('/trips/:tripId/invites',{
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
      body: z.object({
        email: z.string().email(),
  
      })
    }
  } , async (request) =>{
      const {tripId} = request.params
      const { email} = request.body

      const trip = await prisma.trip.findUnique({
        where: {id: tripId}
      })

      if (!trip) {
        throw new Error('Trip not Found')
      }

      const participant = await prisma.participant.create({
        data: {
          email,
          trip_id: tripId, 
           
        }
      })
      const formattedStartDate = dayjs(trip.starts_at).format("LL")
      const formattedEndDate = dayjs(trip.ends_at).format("LL")
  
    
  
      const mail = await getMailClient()

      
      const confirmationLink = `http://localhost:3333/participants/${participant.id}/confirm/${participant.id}`
      
      const message = await mail.sendMail({
        from: {
          name:"Equip plann.er",
          address: "oi@plann.er",
        },
        to : participant.email,
          
        subject: `Confirme sua preseça na viagem para ${trip.destination} em ${formattedStartDate}`,
        html: `
        <div style="font-family:sans-serif; font-size: 16px; line-height: 1.6;">
        <p>Voce convidado para uma viagem para ${trip.destination}</p>
        <p></p>
        <p>para confirmar click no link abaixo</p>
        <p>
          <a href="${confirmationLink}">confirmar</a>
        </p>
      </div>
        `.trim()
      })
  
      console.log(nodemailer.getTestMessageUrl(message))
      return {participantId: participant.id}
    }
  )
}

