import { Request, Response } from "express"
import { getCustomRepository } from "typeorm"
import { SurveyRepository } from "../repositories/SurveyRepository"
import { SurveyUsersRepository } from "../repositories/SurveyUsersRepository"
import { UserRepository } from "../repositories/UserRepository"
import SendMailService from "../services/SendMailService"


class SendMailController {

    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body

        const usersRepository = getCustomRepository(UserRepository)
        const surveysRepository = getCustomRepository(SurveyRepository)
        const surveyUsersRepository = getCustomRepository(SurveyUsersRepository)

        const userAlreadyExists = await usersRepository.findOne({email})
        if (!userAlreadyExists) {
            return response.status(400).json({
                error: "User does not exists"
            })
        }

        const survey = surveysRepository.findOne({id: survey_id})
        if (!survey) {
            return response.status(400).json({
                error: "Survey does not exists"
            })
        }

        //Salvar as informações na tabela
        const surveyUser = surveyUsersRepository.create({
            user_id: userAlreadyExists.id,
            survey_id
        })
        await surveyUsersRepository.save(surveyUser)
        //Enviar e-mail para o usuário

        await SendMailService.execute(email, (await survey).title, (await survey).description)

        return response.json(surveyUser)
    }
}

export { SendMailController }