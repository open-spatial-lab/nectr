import React, { useState } from "react";
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableContent,
  DataTableHeadCell,
  DataTableCell,
  DataTableRow
} from "@rmwc/data-table";
import "@rmwc/data-table/data-table.css";
import { Dialog, DialogAccept } from "@webiny/ui/Dialog";
import { ButtonDefault } from "@webiny/ui/Button";

export const TablePreview: React.FC<{ table: { columns: any[]; data: any[][] } }> = ({ table }) => {
  const [open, setOpen] = useState(false);
  
  return (
      <>
          <ButtonDefault onClick={() => setOpen(true)}>View Table</ButtonDefault>
          <Dialog open={open}>
              <DialogAccept onClick={() => setOpen(false)}>Close</DialogAccept>
              <div style={{ maxWidth: "100%", overflow: "auto" }}>
                  <DataTable>
                      <DataTableContent>
                          <DataTableHead>
                              <DataTableRow>
                                  {table.columns.map((column, index) => (
                                      <DataTableHeadCell key={index}>
                                          {column}
                                      </DataTableHeadCell>
                                  ))}
                              </DataTableRow>
                          </DataTableHead>
                          <DataTableBody>
                              {table.data.map((row, irow) => (
                                  <DataTableRow key={irow}>
                                      {row.map((cell, icell) => (
                                          <DataTableCell key={`${irow}-${icell}`}>{cell}</DataTableCell>
                                      ))}
                                  </DataTableRow>
                              )
                              )}
                          </DataTableBody>
                      </DataTableContent>
                  </DataTable>
              </div>
          </Dialog>
      </>
  );
};
