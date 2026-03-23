import type {
	AutoModerationRuleTriggerType,
	GatewayAutoModerationActionExecutionDispatchData,
	Snowflake,
} from 'discord-api-types/v10';
import { _transformAPIAutoModerationAction } from '../util/Transformers.js';
import type { AutoModerationAction } from './AutoModerationRule.js';
import type { Guild } from './Guild.js';

/**
 * Represents the structure of an executed action when an {@link AutoModerationRule} is triggered.
 */
export class AutoModerationActionExecution {
	/**
	 * The guild where this action was executed from.
	 */
	public guild: Guild;

	/**
	 * The action that was executed.
	 */
	public action: AutoModerationAction;

	/**
	 * The id of the auto moderation rule this action belongs to.
	 */
	public ruleId: Snowflake;

	/**
	 * The trigger type of the auto moderation rule which was triggered.
	 */
	public ruleTriggerType: AutoModerationRuleTriggerType;

	/**
	 * The id of the user that triggered this action.
	 */
	public userId: Snowflake;

	/**
	 * The id of the channel where this action was triggered from.
	 */
	public channelId: Snowflake | null;

	/**
	 * The id of the message that triggered this action.
	 * <info>This will not be present if the message was blocked or the content was not part of any message.</info>
	 */
	public messageId: Snowflake | null;

	/**
	 * The id of any system auto moderation messages posted as a result of this action.
	 */
	public alertSystemMessageId: Snowflake | null;

	/**
	 * The content that triggered this action.
	 * <info>This property requires the {@link GatewayIntentBits.MessageContent} privileged gateway intent.</info>
	 */
	public content: string;

	/**
	 * The word or phrase configured in the rule that triggered this action.
	 */
	public matchedKeyword: string | null;

	/**
	 * The substring in content that triggered this action.
	 */
	public matchedContent: string | null;

	constructor(data: GatewayAutoModerationActionExecutionDispatchData, guild: Guild) {
		this.guild = guild;

		this.action = _transformAPIAutoModerationAction(data.action);

		this.ruleId = data.rule_id;

		this.ruleTriggerType = data.rule_trigger_type;

		this.userId = data.user_id;

		this.channelId = data.channel_id ?? null;

		this.messageId = data.message_id ?? null;

		this.alertSystemMessageId = data.alert_system_message_id ?? null;

		this.content = data.content;

		this.matchedKeyword = data.matched_keyword ?? null;

		this.matchedContent = data.matched_content ?? null;
	}

	/**
	 * The auto moderation rule this action belongs to.
	 *
	 * @type {?AutoModerationRule}
	 * @readonly
	 */
	get autoModerationRule() {
		return this.guild.autoModerationRules.cache.get(this.ruleId) ?? null;
	}

	/**
	 * The channel where this action was triggered from.
	 *
	 * @type {?(GuildTextBasedChannel|ForumChannel|MediaChannel)}
	 * @readonly
	 */
	get channel() {
		return this.guild.channels.cache.get(this.channelId) ?? null;
	}

	/**
	 * The user that triggered this action.
	 *
	 * @type {?User}
	 * @readonly
	 */
	get user() {
		return this.guild.client.users.cache.get(this.userId) ?? null;
	}

	/**
	 * The guild member that triggered this action.
	 *
	 * @type {?GuildMember}
	 * @readonly
	 */
	get member() {
		return this.guild.members.cache.get(this.userId) ?? null;
	}
}
