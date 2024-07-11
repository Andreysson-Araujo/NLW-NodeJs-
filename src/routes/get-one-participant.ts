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

export async function getOneParticipant(app: FastifyInstance) {
  
  app.withTypeProvider<ZodTypeProvider>().get('/participant/:participantId',{
    schema: {
      params: z.object({
        participantId: z.string().uuid(),
      }),
    }
  } , async (request) =>{
      const {participantId} = request.params
     

      const participant = await prisma.participant.findUnique({
        select: {
          id: true,
          name: true,
          email: true,
          is_confirmed: true
        },
      
        where: {id: participantId},
      })

      if (!participant) {
        throw new ClientError('Participant not Found')
      }

      
      

      return {participant}
    }
  )
}