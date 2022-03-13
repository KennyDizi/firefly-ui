// Copyright © 2022 Kaleido, Inc.
//
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Button, Grid, TablePagination, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChartTableHeader } from '../../../components/Headers/ChartTableHeader';
import { getCreatedFilter } from '../../../components/Filters/utils';
import { Header } from '../../../components/Header';
import { HashPopover } from '../../../components/Popovers/HashPopover';
import { DataTable } from '../../../components/Tables/Table';
import { IDataTableRecord } from '../../../components/Tables/TableInterfaces';
import { ApplicationContext } from '../../../contexts/ApplicationContext';
import { SnackbarContext } from '../../../contexts/SnackbarContext';
import {
  FF_Paths,
  ICreatedFilter,
  IDatatype,
  IPagedDatatypeResponse,
} from '../../../interfaces';
import { DEFAULT_PADDING } from '../../../theme';
import { fetchCatcher } from '../../../utils';

const PAGE_LIMITS = [10, 25];

export const OffChainDataTypes: () => JSX.Element = () => {
  const { createdFilter, lastEvent, selectedNamespace } =
    useContext(ApplicationContext);
  const { reportFetchError } = useContext(SnackbarContext);
  const { t } = useTranslation();
  // Datatype
  const [datatypes, setDatatypes] = useState<IDatatype[]>();
  // Data total
  const [datatypeTotal, setDatatypeTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_LIMITS[0]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    if (
      newPage > currentPage &&
      rowsPerPage * (currentPage + 1) >= datatypeTotal
    ) {
      return;
    }
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCurrentPage(0);
    setRowsPerPage(+event.target.value);
  };

  const pagination = (
    <TablePagination
      component="div"
      count={-1}
      rowsPerPage={rowsPerPage}
      page={currentPage}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      rowsPerPageOptions={PAGE_LIMITS}
      labelDisplayedRows={({ from, to }) => `${from} - ${to}`}
      sx={{ color: 'text.secondary' }}
    />
  );

  // Data type
  useEffect(() => {
    const createdFilterObject: ICreatedFilter = getCreatedFilter(createdFilter);

    fetchCatcher(
      `${FF_Paths.nsPrefix}/${selectedNamespace}${
        FF_Paths.datatypes
      }?limit=${rowsPerPage}&count&skip=${rowsPerPage * currentPage}${
        createdFilterObject.filterString
      }`
    )
      .then((datatypeRes: IPagedDatatypeResponse) => {
        setDatatypes(datatypeRes.items);
        setDatatypeTotal(datatypeRes.total);
      })
      .catch((err) => {
        reportFetchError(err);
      });
  }, [rowsPerPage, currentPage, selectedNamespace]);

  const datatypeColHeaders = [
    t('id'),
    t('name'),
    t('dataHash'),
    t('messageID'),
    t('validator'),
    t('version'),
    t('created'),
  ];

  const datatypeRecords: IDataTableRecord[] | undefined = datatypes?.map(
    (d) => ({
      key: d.id,
      columns: [
        {
          value: <HashPopover shortHash address={d.id}></HashPopover>,
        },
        {
          value: <Typography>{d.name}</Typography>,
        },
        {
          value: <HashPopover shortHash address={d.hash}></HashPopover>,
        },
        {
          value: <HashPopover shortHash address={d.message}></HashPopover>,
        },
        {
          value: <Typography>{d.validator}</Typography>,
        },
        {
          value: <Typography>{d.version}</Typography>,
        },
        {
          value: dayjs(d.created).format('MM/DD/YYYY h:mm A'),
        },
      ],
    })
  );

  return (
    <>
      <Header title={t('datatypes')} subtitle={t('offChain')}></Header>
      <Grid container px={DEFAULT_PADDING}>
        <Grid container item wrap="nowrap" direction="column">
          <ChartTableHeader
            title={t('allDatatypes')}
            filter={
              <Button variant="outlined">
                <Typography p={0.75} sx={{ fontSize: 12 }}>
                  {t('filter')}
                </Typography>
              </Button>
            }
          />
          <DataTable
            stickyHeader={true}
            minHeight="300px"
            maxHeight="calc(100vh - 340px)"
            records={datatypeRecords}
            columnHeaders={datatypeColHeaders}
            {...{ pagination }}
            emptyStateText={t('noDatatypesToDisplay')}
          />
        </Grid>
      </Grid>
    </>
  );
};
