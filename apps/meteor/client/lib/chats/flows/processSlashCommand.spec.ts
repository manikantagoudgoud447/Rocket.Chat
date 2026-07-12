import type { IMessage } from '@rocket.chat/core-typings';
import { processSlashCommand } from './processSlashCommand';
import { slashCommands } from '../../../../app/utils/client';
import { sdk } from '../../../../app/utils/client/lib/SDKClient';
import type { ChatAPI } from '../ChatAPI';

jest.mock('../../../../app/utils/client', () => ({
	slashCommands: {
		commands: {
			msg: {
				command: 'msg',
			},
		},
	},
}));

jest.mock('../../../../app/utils/client/lib/SDKClient', () => ({
	sdk: {
		rest: {
			post: jest.fn().mockResolvedValue({ result: 'success' }),
		},
	},
}));

jest.mock('../../../../app/authorization/client', () => ({
	hasAtLeastOnePermission: jest.fn().mockReturnValue(true),
}));

describe('processSlashCommand', () => {
	it('should parse multi-line slash command arguments correctly', async () => {
		const chat = {
			uid: 'test-user',
			ActionManager: {
				generateTriggerId: jest.fn().mockReturnValue('trigger-id'),
				notifyBusy: jest.fn(),
				notifyIdle: jest.fn(),
			},
			composer: {
				clear: jest.fn(),
			},
		} as unknown as ChatAPI;

		const message: IMessage = {
			_id: 'msg-id',
			rid: 'room-id',
			msg: '/msg some-user\nmulti-line\nmessage',
			u: { _id: 'test-user', username: 'test' },
			ts: new Date(),
			_updatedAt: new Date(),
		};

		const result = await processSlashCommand(chat, message);

		expect(result).toBe(true);
		expect(sdk.rest.post).toHaveBeenCalledWith('/v1/commands.run', expect.objectContaining({
			command: 'msg',
			params: ' some-user\nmulti-line\nmessage',
			roomId: 'room-id',
		}));
	});
});
