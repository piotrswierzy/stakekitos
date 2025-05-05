import { registerAs } from '@nestjs/config';

export default registerAs('stacks', () => ({
  nodeUrl: process.env.STACKS_NODE_URL || 'https://stacks-node.example.com',
  pox: {
    address: process.env.STACKS_POX_ADDRESS!,
    name: 'pox',
  },
}));
