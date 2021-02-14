import ReactQueryWrapper from './index.js';
import {QueryClient} from 'react-query';

// Create a client
const queryClient = new QueryClient();

await queryClient.fetchQuery(['1', '2'], () => ({id: '0', __typename: 'user'}));

console.log('-----', 'a', queryClient.getQueryCache().findAll());
