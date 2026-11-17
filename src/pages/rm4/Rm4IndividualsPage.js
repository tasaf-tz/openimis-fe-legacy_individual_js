import React from 'react';

import Rm4IndividualsSearcher from '../../components/rm4/Rm4IndividualsSearcher';
import { RIGHT_RM4_INDIVIDUAL_SEARCH } from '../../constants';
import Rm4ListPage from './Rm4ListPage';

const Rm4IndividualsPage = () => (
  <Rm4ListPage helmet="rm4.individuals.helmet" right={RIGHT_RM4_INDIVIDUAL_SEARCH}>
    <Rm4IndividualsSearcher />
  </Rm4ListPage>
);

export default Rm4IndividualsPage;
