class CreateNotificationDto {
  constructor(data) {
    this.userId = data.userId;
    this.type = data.type;
    this.title = data.title;
    this.message = data.message;
    this.actionUrl = data.actionUrl || null;
    this.metadata = data.metadata || null;
  }

  static validate(data) {
    if (!data.userId) throw new Error('userId is required');
    if (!data.type) throw new Error('type is required');
    if (!data.title) throw new Error('title is required');
    if (!data.message) throw new Error('message is required');
    return true;
  }
}

module.exports = CreateNotificationDto;