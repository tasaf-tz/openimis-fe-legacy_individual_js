import React from 'react';

import Rm4GroupsSearcher from '../../components/rm4/Rm4GroupsSearcher';
import { RIGHT_RM4_GROUP_SEARCH } from '../../constants';
import Rm4ListPage from './Rm4ListPage';

const Rm4GroupsPage = () => (
  <Rm4ListPage helmet="rm4.groups.helmet" right={RIGHT_RM4_GROUP_SEARCH}><Rm4GroupsSearcher /></Rm4ListPage>
);

export default Rm4GroupsPage;
