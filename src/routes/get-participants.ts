import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {dayjs} from "../lib/dayjs"
import { z } from "zod";
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/pt-br'
import { prisma } from "../lib/prisma";
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer"
import { link } from "fs";

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export async function getParticipants(app: FastifyInstance) {
  
  app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/participants',{
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
    }
  } , async (request) =>{
      const {tripId} = request.params
     

      const trip = await prisma.trip.findUnique({
        

        where: {id: tripId},
        include: {
          participant: {
            select: {
              id: true,
              name: true,
              email: true,
              is_confirmed: true
            }
          }
        }
      })

      if (!trip) {
        throw new Error('Trip not Found')
      }

      
      

      return {participant: trip.participant }
    }
  )
}