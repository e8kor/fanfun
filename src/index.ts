'use strict';
import BootBot from 'bootbot';
import {Payload} from "./types/PayloadTypes";
import {Chat, Conversation} from "./types/ChatTypes";
import * as dotenv from 'dotenv';

dotenv.config()
const bot = new BootBot({
  accessToken: process.env['FB_ACCESS_TOKEN'],
  verifyToken: process.env['FB_VERIFY_TOKEN'],
  appSecret: process.env['FB_APP_SECRET']
});

bot.on('message', (payload: Payload, chat: Chat) => {
	const text = payload.message.text;
	console.log(`The user said: ${text}`);
});

bot.hear(['hello', 'hi', /hey( there)?/i], (payload: Payload, chat: Chat) => {
	console.log('The user said "hello", "hi", "hey", or "hey there"');
});

bot.hear(['hello', 'hi', /hey( there)?/i], (payload: Payload, chat: Chat) => {
	// Send a text message followed by another text message that contains a typing indicator
	chat.say('Hello, human friend!').then(() => {
		chat.say('How are you today?', { typing: true });
	});
});

bot.hear(['food', 'hungry'], (payload: Payload, chat: Chat) => {
	// Send a text message with quick replies
	chat.say({
		text: 'What do you want to eat today?',
		quickReplies: ['Mexican', 'Italian', 'American', 'Argentine']
	});
});

bot.hear(['help'], (payload: Payload, chat: Chat) => {
	// Send a text message with buttons
	chat.say({
		text: 'What do you need help with?',
		buttons: [
			{ type: 'postback', title: 'Settings', payload: 'HELP_SETTINGS' },
			{ type: 'postback', title: 'FAQ', payload: 'HELP_FAQ' },
			{ type: 'postback', title: 'Talk to a human', payload: 'HELP_HUMAN' }
		]
	});
});

bot.hear('image', (payload: Payload, chat: Chat) => {
	// Send an attachment
	chat.say({
		attachment: 'image',
		url: 'http://example.com/image.png'
	});
});

bot.hear('ask me something', (payload: Payload, chat: Chat) => {
	chat.conversation((convo:Conversation) => {
		askName(convo);
	});

	const askName = (convo:Conversation) => {
		convo.ask(`What's your name?`, (payload: Payload, convo:Conversation) => {
			const text = payload.message.text;
			convo.set('name', text);
			convo.say(`Oh, your name is ${text}`).then(() => askFavoriteFood(convo));
		});
	};

	const askFavoriteFood = (convo:Conversation) => {
		convo.ask(`What's your favorite food?`, (payload: Payload, convo:any) => {
			const text = payload.message.text;
			convo.set('food', text);
			convo.say(`Got it, your favorite food is ${text}`).then(() => sendSummary(convo));
		});
	};

	const sendSummary = (convo:Conversation) => {
		convo.say(`Ok, here's what you told me about you:
	      - Name: ${convo.get('name')}
	      - Favorite Food: ${convo.get('food')}`);
      convo.end();
	};
});

bot.start(process.env['PORT']);