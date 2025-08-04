export class CreateChatSessionDto {
  clientId: number;
  assignedUserId?: number;
  status?: 'open' | 'closed' | 'transferred' | 'pending';
}