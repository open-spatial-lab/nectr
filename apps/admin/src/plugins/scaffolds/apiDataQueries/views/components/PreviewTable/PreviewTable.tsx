import * as React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import { PreviewTableProps } from './types'
import Alert from '@mui/material/Alert'
import styled from '@emotion/styled'
import { Tooltip } from '@mui/material'
import TablePagination from '@mui/material/TablePagination'
import { CircularProgress } from '@mui/material'

const TruncatedSpan = styled('div')`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}`

const TableContainerOuter = styled('div')<{ loading: boolean }>`
  position: relative;
  opacity: ${props => (props.loading ? 0.5 : 1)};
  pointer-events: ${props => (props.loading ? 'none' : 'auto')};
  padding: 0 2rem;
  @media (min-width: 840px) {
    padding: 0 1rem 0 0;
  }
`

const LoadingIcon = styled(CircularProgress)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`
const TruncatedPreviw: React.FC<{ content: string }> = ({ content }) => {
  return (
    <Tooltip title={content}>
      <TruncatedSpan>{content}</TruncatedSpan>
    </Tooltip>
  )
}

export const PreviewTable: React.FC<PreviewTableProps> = ({ id, data, page, setPage, raw }) => {
  return (
    <div>
      <TableView {...{ id, data, page, setPage, raw }} />
      {/* <TableError data={data} /> */}
    </div>
  )
}

const ErrorFeedback: React.FC<{ error: string }> = ({ error }) => {
  return <Alert severity="error">{error}</Alert>
}

const paginatedEntries = 10
const TableView: React.FC<PreviewTableProps> = ({ data, page, setPage, id,raw }) => {
  const [loading, setLoading] = React.useState(false)
  const [maxEntries, setMaxEntries] = React.useState(-1)

  React.useEffect(() => {
    setLoading(true)
  }, [page])

  React.useEffect(() => {
    setLoading(false)
  }, [data])

  if (!data || !data.ok) {
    return null
  }
  const rows = data.result
  const columns = rows.length ? Object.keys(rows[0]) : []

  if (!columns.length) {
    if (page > 0) {
      setPage(p => {
        setMaxEntries((((p - 1)||1) * paginatedEntries))
        return p - 1
      })
    }
    return <ErrorFeedback error="No data found." />
  }
  const jsonEndpoint = `${process.env.REACT_APP_API_URL}/data-query/${id}`
  const csvEndppint = jsonEndpoint + '?format=csv'
  return (
    <TableContainerOuter loading={loading}>
      {loading && <LoadingIcon />}
      <TableContainer component={Paper}>
        <Table size="small" aria-label="a dense table">
          <TableHead>
            <TableRow>
              {columns.map((c, i) => (
                <TableCell key={`${c}${i}`}>{c}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, ri) => (
              <TableRow key={`${ri}`}>
                {columns.map((c, ci) => (
                  <TableCell key={`${c}${ri}${ci}`}>
                    <TruncatedPreviw content={`${JSON.stringify(row[c])}`} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {!raw && <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={maxEntries}
        rowsPerPage={10}
        page={page}
        onPageChange={(_e, page) => setPage(page)}
      />}
      {Boolean(id && !raw) && (
        <ul>
          <li>
            <h3>Data Endpoints</h3>
          </li>
          <br></br>
          <li>
            <strong>
              <a href={csvEndppint} target="_blank" rel="noreferrer">
                Comma Separated Values (CSV)
              </a>
            </strong>
          </li>
          <br></br>
          <li>
            <strong>
              <a href={jsonEndpoint} target="_blank" rel="noreferrer">
                JSON
              </a>
            </strong>
          </li>
        </ul>
      )}
    </TableContainerOuter>
  )
}
