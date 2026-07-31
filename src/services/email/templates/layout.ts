import { renderHeader, renderFooter } from '../components';

export const emailLayout = (title: string, preheader: string, content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Preheader -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    ${preheader}
  </div>

  <div style="padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      ${renderHeader()}
      
      <div style="padding: 32px 0; color: #374151; font-size: 16px; line-height: 24px;">
        ${content}
      </div>

      ${renderFooter()}
    </div>
  </div>
</body>
</html>
`;
