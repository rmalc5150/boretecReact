"use client";
import React, { useState } from 'react';
import { InvokeCommand, InvokeCommandInput } from '@aws-sdk/client-lambda';
import { lambdaClient } from '../../lib/amazon';

interface PdfViewerProps {
    fileName: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ fileName }) => {
    const [buttonLabel, setButtonLabel] = useState('Drawings'); // State to manage button label

    const fetchPdfAndOpenInNewTab = async () => {
        setButtonLabel('Downloading'); // Change button label to indicate downloading
        const payload = { fileName };
        const params: InvokeCommandInput = {
            FunctionName: 'boretec_download_pdf',
            Payload: JSON.stringify(payload),
        };

        try {
            const command = new InvokeCommand(params);
            const response = await lambdaClient.send(command);
            // Correctly handle the potential undefined Payload
            if (response.Payload) {
                // Assuming Payload is a Buffer or Uint8Array; convert it directly
                const resultString = new TextDecoder("utf-8").decode(response.Payload);
                const result = JSON.parse(resultString);

                if (result.statusCode === 200) {
                    const body = JSON.parse(result.body);
                    openPdfInSameWindow(body.pdfData);
                } else {
                    console.error('Failed to download the file', result.errorMessage || '');
                }
            }
        } catch (error) {
            console.error('Error invoking Lambda function', error);
        } finally {
            setButtonLabel('Drawings'); // Change the button label back after the operation
        }
    };

    const openPdfInNewTab = (base64Data: string) => { // Now explicitly typed
        const binaryString = window.atob(base64Data); // Decode base64
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank'); // Open the PDF in a new tab
    };

    const openPdfInSameWindow = (base64Data: string) => { // Now opens PDF in the same window
        const binaryString = window.atob(base64Data); // Decode base64
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.location.href = url; // Navigate the current window to the blob URL
    };

    return (
        <div>
            <button onClick={fetchPdfAndOpenInNewTab}>{buttonLabel}</button>
        </div>
    );
};

export default PdfViewer;
