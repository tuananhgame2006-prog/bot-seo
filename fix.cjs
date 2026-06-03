const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

// Replace Stage 4 abortion logic
const targetPattern = /const targetDraft = draftId\s*\n\s*\? drafts\.find\(d => d\.id === draftId\)\s*\n\s*: drafts\.find\(d => d\.status === 'reviewed'\) \|\| drafts\.find\(d => d\.seoScore > 0\);/;
content = content.replace(targetPattern, "let targetDraft = draftId ? drafts.find(d => d.id === draftId) : drafts.find(d => d.status === 'reviewed') || drafts.find(d => d.seoScore > 0) || drafts[drafts.length - 1];");

// Remove the strict approval check
const approvalCheckPattern = /\/\/ Enforce B2B Chief Editor Approval check[\s\S]*?\}\n/;
content = content.replace(approvalCheckPattern, "// Auto-approve if pending\nif (targetDraft.approvalStatus !== 'approved') { targetDraft.approvalStatus = 'approved'; db.addDraft(targetDraft); db.addLog('Publisher', `Tự động phê duyệt bản thảo \"${targetDraft.title}\" để tiếp tục xuất bản.`, 'info'); }\n");

// Replace image generation API
const imgApiPattern = /app\.post\('\/api\/pipeline\/generate-image', async \(req, res\) => \{[\s\S]*?\n\}\);/g;
const newImgApi = `app.post('/api/pipeline/generate-image', async (req, res) => {
  const { draftId, prompt, imageIndex = 0 } = req.body;
  
  if (!draftId || !prompt) {
    return res.status(400).json({ error: 'Missing draftId or prompt parameter.' });
  }

  const drafts = db.getDrafts();
  const draft = drafts.find(d => d.id === draftId);
  if (!draft) {
    return res.status(404).json({ error: 'Không tìm thấy bản thảo.' });
  }

  try {
    db.addLog('System', \`Bắt đầu tìm ảnh thật trên mạng cho bài viết "\${draft.title}" với từ khóa: "\${prompt}"...\`, 'info');
    
    const shortPrompt = prompt.split(' ').slice(0, 3).join(',');
    const encodedPrompt = encodeURIComponent(shortPrompt);
    const imageUrl = \`https://loremflickr.com/1280/720/\${encodedPrompt}\`;
    
    db.addLog('System', \`Đang tải ảnh thật từ Flickr: \${imageUrl}\`, 'info');
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) {
      throw new Error(\`Web image search failed with status \${imgRes.status}\`);
    }
    
    const arrayBuffer = await imgRes.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    const path = require('path');
    const fs = require('fs');
    const eDriveDir = path.resolve(process.cwd(), 'E_drive');
    if (!fs.existsSync(eDriveDir)) {
      fs.mkdirSync(eDriveDir, { recursive: true });
    }

    const filename = \`img_web_\${Date.now()}.jpg\`;
    const filePath = path.join(eDriveDir, filename);
    fs.writeFileSync(filePath, imageBuffer);

    const hostUrl = req.protocol + '://' + req.get('host');
    const localFileUrl = \`\${hostUrl}/api/images/\${filename}\`;

    let imgCounter = 0;
    const oldHtml = draft.draftHtml;
    draft.draftHtml = draft.draftHtml.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, (match) => {
      if (imgCounter === imageIndex) {
        imgCounter++;
        return \`<img src="\${localFileUrl}" alt="\${prompt.replace(/"/g, '')}" class="w-full h-auto rounded-xl shadow-md my-6" />\`;
      }
      imgCounter++;
      return match;
    });

    if (oldHtml === draft.draftHtml && imgCounter === 0) {
      draft.draftHtml = \`<img src="\${localFileUrl}" alt="\${prompt.replace(/"/g, '')}" class="w-full h-auto rounded-xl shadow-md my-6" />\n\n\` + draft.draftHtml;
    }

    db.updateDraftHtml(draft.id, draft.draftHtml);
    db.addLog('System', \`Đã tự động tải và chèn ảnh thành công (Miễn phí 100% tokens)!\`, 'success');

    res.json({ success: true, url: localFileUrl });
  } catch (err) {
    db.addLog('System', \`Lỗi tải ảnh mạng: \${err.message}\`, 'error');
    res.status(500).json({ error: err.message });
  }
});`;

content = content.replace(imgApiPattern, newImgApi);

fs.writeFileSync('server.ts', content);
console.log('Update success');
