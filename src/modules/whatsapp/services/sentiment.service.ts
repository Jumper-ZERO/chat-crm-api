import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Message } from "../../chats/entities";
import { SentimentClient } from "../clients/sentiment.client";
import { SentimentAnalysis } from "../entities/sentiment-analysis.entity";

@Injectable()
export class SentimentService {
  constructor(
    @InjectRepository(SentimentAnalysis)
    private readonly repo: Repository<SentimentAnalysis>,
    private readonly client: SentimentClient,
  ) { }

  async save(message: Message) {
    const { probabilities, label } = await this.client.analyze(message.body);

    const data = this.repo.create({
      message: message,
      model: 'default',
      label,
      pos: probabilities.POS,
      neu: probabilities.NEU,
      neg: probabilities.NEG,
    });

    const analysis = await this.repo.save(data);

    return analysis
  }
}