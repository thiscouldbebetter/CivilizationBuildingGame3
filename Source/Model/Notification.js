"use strict";
class Notification_ // To disambiguate from the built-in Notification class.
 {
    constructor(timestampInTurns, message) {
        this.timestampInTurns = timestampInTurns;
        this.message = message;
    }
}
class NotificationLog {
    constructor(notifications) {
        this.notifications = notifications || [];
    }
    static create() {
        return new NotificationLog(null);
    }
    clear() {
        this.notifications.length = 0;
    }
    notificationDismiss(notification) {
        this.notifications.splice(this.notifications.indexOf(notification), 1);
    }
    notifyByMessageForWorld(message, world) {
        var turn = world.turnsSoFar;
        var notification = new Notification_(turn, message);
        this.notifications.push(notification);
    }
}
