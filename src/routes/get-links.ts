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

export async function getLinks(app: FastifyInstance) {
  
  app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/links',{
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
          links: true,
        }
      })

      if (!trip) {
        throw new ClientError('Trip not Found')
      }

      
      

      return {links: trip.links }
    }
  )
}