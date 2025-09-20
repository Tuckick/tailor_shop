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
                    className={cn("w-full bg-gray-50 border-gray-300", className)}
                    required={required}
                    style={{ boxShadow: 'none' }} // Remove any default box shadow
                />
            }
            placeholderText={placeholderText}
            minDate={minDate || new Date()}
            dateFormat={dateFormat}
            disabled={disabled}
            showMonthYearPicker={showMonthYearPicker}
            showYearPicker={showYearPicker}
            // Add custom styling for the calendar popup
            calendarClassName="bg-white shadow-lg border border-gray-200 rounded-lg"
            dayClassName={date => "hover:bg-violet-100"}
            popperClassName="date-picker-popper"
        />
    );
};

export { CustomDatePicker };