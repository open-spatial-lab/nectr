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

export const PreviewTable: React.FC<PreviewTableProps> = ({ data, page, setPage }) => {
  return (
    <div>
      <TableView data={data} page={page} setPage={setPage} />
      {/* <TableError data={data} /> */}
    </div>
  )
}

const ErrorFeedback: React.FC<{ error: string }> = ({ error }) => {
  return <Alert severity="error">{error}</Alert>
}

const TableView: React.FC<PreviewTableProps> = ({ data, page, setPage }) => {
  const [loading, setLoading] = React.useState(false)

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
    return <ErrorFeedback error="No data found." />
  }
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
      <TablePagination
        rowsPerPageOptions={[10]}
        component="div"
        count={-1}
        rowsPerPage={10}
        page={page}
        onPageChange={(_e, page) => setPage(page)}
      />
    </TableContainerOuter>
  )
}
