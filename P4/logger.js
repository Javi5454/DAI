import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const logger = createLogger({
    level: 'info', //Nivel mínimo para registrar 
    format: format.combine(
        format.timestamp(), //Agregar marcas de tiempo
        format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}] : ${message}`;
        })
    ),
    transports: [
        new transports.Console(), //Log a la consola

        //Archivo combinado con rotacion diaria
        new transports.DailyRotateFile({
            filename: 'logs/combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '10m', //Tamaño maximo de 10MB para cada archivo
            maxFiles: '14d', //Mantener logs por 14 días
            level: 'info', //Nivel 'info' y superior
        }),

        //Archivo para errores, tambien rotado
        new transports.DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '10m', //Tamaño maximo de 10MB para cada archivo
            maxFiles: '30d', //Mantener logs por 14 días
            level: 'error', //Nivel 'error' y superior
        })
    ],
});

//Si no estamos en production, mostramos logs detallados en consola
if (process.env.IN !== 'production') {
    logger.add(
        new transports.Console({
            format: format.combine(
                format.colorize(),//Coloreamos logs en consola
                format.simple()
            )
        })
    )
}

export default logger;