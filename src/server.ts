import fastify from "fastify"
import cors from "@fastify/cors"
import { prisma } from "./lib/prisma"
import { createTrip } from "./routes/create-trip"
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod"
import { confirmTrip } from "./routes/confirm-trip"
import { confirmParticipant } from "./routes/confirm-participant"
import { createActivity } from "./routes/create-activity"
import { getActivity } from "./routes/get-activities"
import { createLink } from "./routes/create-links"
import { getLinks } from "./routes/get-links"
import { getParticipants } from "./routes/get-participants"
import { createInvite } from "./routes/create-invite"
import { updateTrip } from "./routes/update-trip"
import { getTrioDetails } from "./routes/get-trip-details"
import { getOneParticipant } from "./routes/get-one-participant"
import { env } from "./env"

const app = fastify()

app.register(cors, {
  origin: '*',
})

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(createTrip)
app.register(confirmTrip)
app.register(updateTrip)
app.register(getTrioDetails)
app.register(confirmParticipant)
app.register(getParticipants)
app.register(getOneParticipant)
app.register(createActivity)
app.register(getActivity)
app.register(createLink)
app.register(getLinks)
app.register(createInvite)

app.listen({port: env.PORT}).then(() => {
  console.log(`Server running in PORT`)
})