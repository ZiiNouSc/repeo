import React, { ReactNode } from 'react';
import clsx from 'clsx';

interface TableProps {
  children: ReactNode;
  className?: string;
}

interface TableHeaderProps {
  children: ReactNode;
}

interface TableBodyProps {
  children: ReactNode;
}

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TableHeaderCellProps {
  children: ReactNode;
  className?: string;
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto">
      <table className={clsx('min-w-full divide-y divide-gray-200', className)}>
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  return <thead className="bg-gray-50">{children}</thead>;
};

export const TableBody: React.FC<TableBodyProps> = ({ children }) => {
  return <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
};

export const TableRow: React.FC<TableRowProps> = ({ 
  children, 
  className = '', 
  onClick 
}) => {
  return (
    <tr 
      className={clsx(
        onClick && 'hover:bg-gray-50 cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
};

export const TableHeaderCell: React.FC<TableHeaderCellProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <th className={clsx('table-header', className)}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <td className={clsx('table-cell', className)}>
      {children}
    </td>
  );
};