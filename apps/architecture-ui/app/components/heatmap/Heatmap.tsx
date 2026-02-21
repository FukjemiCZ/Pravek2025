"use client";

import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

export default function Heatmap({ heatmap }: any) {
    const { domains, epics, matrix } = heatmap;

    const map = new Map<string, number>(
        matrix.map((x: any) => [
            `${x.domainId}-${x.epicId}`,
            Number(x.count)
        ])
    );
    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Domain / Epic</TableCell>
                    {epics.map((e: any) => (
                        <TableCell key={e.id}>{e.id}</TableCell>
                    ))}
                </TableRow>
            </TableHead>
            <TableBody>
                {domains.map((d: any) => (
                    <TableRow key={d.id}>
                        <TableCell>{d.id}</TableCell>
                        {epics.map((e: any) => (
                            <TableCell key={e.id}>
                                {Number(map.get(`${d.id}-${e.id}`) ?? 0)}
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}