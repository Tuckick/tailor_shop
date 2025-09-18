import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface DatePickerProps {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    className?: string;
    placeholderText?: string;
    minDate?: Date;
    disabled?: boolean;
    required?: boolean;
    showMonthYearPicker?: boolean;
    showYearPicker?: boolean;
    dateFormat?: string;
}

const CustomDatePicker = ({
    selected,
    onChange,
    className,
    placeholderText = "เลือกวันที่",
    minDate,
    disabled,
    required,
    showMonthYearPicker,
    showYearPicker,
    dateFormat = "dd/MM/yyyy"
}: DatePickerProps) => {
    return (
        <DatePicker
            selected={selected}
            onChange={onChange}
            customInput={
                <Input
                    className={cn("w-full", className)}
                    required={required}
                />
            }
            placeholderText={placeholderText}
            minDate={minDate || new Date()}
            dateFormat={dateFormat}
            disabled={disabled}
            showMonthYearPicker={showMonthYearPicker}
            showYearPicker={showYearPicker}
        />
    );
};

export { CustomDatePicker };