import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer"
import { dayjs } from "../lib/dayjs";



export async function confirmTrip(app: FastifyInstance) {
  
  app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/confirm',{
    schema: {
      params: z.object({
        tripId:z.string().uuid()
      })
    }
  } , async (request, reply) =>{
      const {tripId} = request.params

      const trip = await prisma.trip.findUnique({
        where: {
          id: tripId,
        },
        include: {
          participant:{
            where: {
              is_owner: false
            }
          }
        }
      })

      if (!trip) {
        throw new Error('Trip not found')
      }

      if (trip.is_confirmed){
        return reply.redirect(`http://localhost:3000/trips/${tripId}`)
      }

      await prisma.trip.update({
        where: {id: tripId},
        data: {is_confirmed: true}
      })

      
      //const participants = await prisma.participant.findMany({
      //  where: {
      //    trip_id: tripId,
      //    is_owner: false,
      //  }
      //})

      const formattedStartDate = dayjs(trip.starts_at).format("LL")
      const formattedEndDate = dayjs(trip.ends_at).format("LL")
  
    
  
      const mail = await getMailClient()

      
      await Promise.all(
        trip.participant.map(async (participant) => {
          const confirmationLink = `http://localhost:3333/trips/${trip.id}/confirm/${participant.id}`
          
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
        })
        
      )


      return reply.redirect(`http://localhost:3000/trips/${tripId}`)
  })
}