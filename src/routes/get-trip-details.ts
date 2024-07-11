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
import { ClientError } from "../errors/client-error";

dayjs.locale('pt-br')
dayjs.extend(localizedFormat)

export async function getTrioDetails(app: FastifyInstance) {
  
  app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId',{
    schema: {
      params: z.object({
        tripId: z.string().uuid(),
      }),
    }
  } , async (request) =>{
      const {tripId} = request.params
     

      const trip = await prisma.trip.findUnique({
        select: {
          id: true,
          destination: true,
          starts_at: true,
          ends_at: true,
          is_confirmed: true,
        },
        where: {id: tripId},
      })

      if (!trip) {
        throw new ClientError('Trip not Found')
      }

      
      

      return {trip }
    }
  )
}