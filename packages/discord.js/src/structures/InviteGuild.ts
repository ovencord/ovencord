import type { APIInviteGuild } from 'discord-api-types/v10';
import type { Client } from '../client/Client.js';
import { AnonymousGuild } from './AnonymousGuild.js';
import { WelcomeScreen } from './WelcomeScreen.js';

/**
 * Represents a guild received from an invite, includes welcome screen data if available.
 *
 * @extends {AnonymousGuild}
 */
export class InviteGuild extends AnonymousGuild {
	public welcomeScreen: WelcomeScreen | null;
	constructor(client: Client, data: APIInviteGuild) {
		super(client, data);

		/**
		 * The welcome screen for this invite guild
		 *
		 * @type {?WelcomeScreen}
		 */
		this.welcomeScreen = (data as unknown as { welcome_screen?: Record<string, unknown> }).welcome_screen
			? new WelcomeScreen(this as any, (data as unknown as { welcome_screen: Record<string, unknown> }).welcome_screen)
			: null;
	}
}
