
class Notification_ // To disambiguate from the built-in Notification class.
{
	timestampInTurns: number;
	message: string;

	constructor(timestampInTurns: number, message: string)
	{
		this.timestampInTurns = timestampInTurns;
		this.message = message;
	}
}

class NotificationLog
{
	notifications: Notification_[];

	constructor(notifications: Notification_[])
	{
		this.notifications = notifications || [];
	}

	static create(): NotificationLog
	{
		return new NotificationLog(null);
	}

	clear(): void
	{
		this.notifications.length = 0;
	}

	notificationDismiss(notification: Notification_): void
	{
		this.notifications.splice
		(
			this.notifications.indexOf(notification), 1
		);
	}

	notifyByMessageForWorld(message: string, world: any): void
	{
		var turn = world.turnsSoFar;
		var notification = new Notification_(turn, message);
		this.notifications.push(notification);
	}
}
