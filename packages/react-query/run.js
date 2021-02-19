// import ReactQueryWrapper from './index.js';
import {QueryClient} from 'react-query';

// Create a client
const queryClient = new QueryClient();

queryClient.setQueryData('123', () => 'AAA');

console.log('-----', 'a', queryClient.getQueryCache().findAll());
