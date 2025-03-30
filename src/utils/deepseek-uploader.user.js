
// ==UserScript==
// @name         DeepSeek Direct Uploader
// @namespace    https://chat.deepseek.com/
// @version      1.0
// @description  Directly upload DeepSeek conversations to your platform
// @author       You
// @match        https://chat.deepseek.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=deepseek.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let state = {
        targetResponse: null,
        lastUpdateTime: null,
        convertedMd: null
    };

    const log = {
        info: (msg) => console.log(`[DeepSeek Uploader] ${msg}`),
        error: (msg, e) => console.error(`[DeepSeek Uploader] ${msg}`, e)
    };

    const targetUrlPattern = /chat_session_id=/;
    const apiUrl = "https://question-helper-hub.lovable.app/api/upload";

    function processTargetResponse(text, url) {
        try {
            if (targetUrlPattern.test(url)) {
                state.targetResponse = text;
                state.lastUpdateTime = new Date().toLocaleTimeString();
                updateButtonStatus();
                log.info(`成功捕获目标响应 (${text.length} bytes) 来自: ${url}`);

                state.convertedMd = convertJsonToMd(JSON.parse(text));
                log.info('成功将JSON转换为Markdown');
            }
        } catch (e) {
            log.error('处理目标响应时出错:', e);
        }
    }

    function updateButtonStatus() {
        const jsonButton = document.getElementById('downloadJsonButton');
        const mdButton = document.getElementById('downloadMdButton');
        const uploadButton = document.getElementById('uploadButton');
        
        if (jsonButton && mdButton && uploadButton) {
            const hasResponse = state.targetResponse !== null;
            jsonButton.style.backgroundColor = hasResponse ? '#28a745' : '#007bff';
            mdButton.style.backgroundColor = state.convertedMd ? '#28a745' : '#007bff';
            uploadButton.style.backgroundColor = hasResponse ? '#ff7f00' : '#007bff';
            
            const statusText = hasResponse ? `最后更新: ${state.lastUpdateTime}\n数据已准备好` : '等待目标响应中...';
            jsonButton.title = statusText;
            mdButton.title = statusText;
            uploadButton.title = statusText;
        }
    }

    function createDownloadButtons() {
        const buttonContainer = document.createElement('div');
        const jsonButton = document.createElement('button');
        const mdButton = document.createElement('button');
        const uploadButton = document.createElement('button');

        Object.assign(buttonContainer.style, {
            position: 'fixed',
            top: '45%',
            right: '10px',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            opacity: '0.7',
            transition: 'opacity 0.3s ease',
            cursor: 'move'
        });

        const buttonStyles = {
            padding: '8px 12px',
            backgroundColor: '#007bff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: 'Arial, sans-serif',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            whiteSpace: 'nowrap',
            fontSize: '14px'
        };

        jsonButton.id = 'downloadJsonButton';
        jsonButton.innerText = 'JSON';
        mdButton.id = 'downloadMdButton';
        mdButton.innerText = 'MD';
        uploadButton.id = 'uploadButton';
        uploadButton.innerText = '上传';

        Object.assign(jsonButton.style, buttonStyles);
        Object.assign(mdButton.style, buttonStyles);
        Object.assign(uploadButton.style, { ...buttonStyles, backgroundColor: '#ff7f00' });

        buttonContainer.onmouseenter = () => buttonContainer.style.opacity = '1';
        buttonContainer.onmouseleave = () => buttonContainer.style.opacity = '0.7';

        // Drag functionality
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        buttonContainer.onmousedown = dragStart;
        document.onmousemove = drag;
        document.onmouseup = dragEnd;

        function dragStart(e) {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            if (e.target === buttonContainer) {
                isDragging = true;
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                xOffset = currentX;
                yOffset = currentY;
                setTranslate(currentX, currentY, buttonContainer);
            }
        }

        function dragEnd() {
            isDragging = false;
        }

        function setTranslate(xPos, yPos, el) {
            el.style.transform = `translate(${xPos}px, ${yPos}px)`;
        }

        // JSON download button
        jsonButton.onclick = function() {
            if (!state.targetResponse) {
                alert('还没有发现有效的对话记录。\n请等待目标响应或进行一些对话。');
                return;
            }
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                const originalData = JSON.parse(state.targetResponse);
                const enhancedData = {
                    ...originalData,
                    url: window.location.href,    
                };
                const chatName = `DeepSeek - ${enhancedData.data.biz_data.chat_session.title || 'Untitled Chat'}`.replace(/[\/\\?%*:|"<>]/g, '-');
                const fileName = `${chatName}_${timestamp}.json`;

                const blob = new Blob([JSON.stringify(enhancedData)], { type: 'application/json' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = fileName;
                link.click();

                log.info(`成功下载文件: ${fileName}`);
            } catch (e) {
                log.error('下载过程中出错:', e);
                alert('下载过程中发生错误，请查看控制台了解详情。');
            }
        };

        // Markdown download button
        mdButton.onclick = function() {
            if (!state.convertedMd) {
                alert('还没有发现有效的对话记录。\n请等待目标响应或进行一些对话。');
                return;
            }
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                const jsonData = JSON.parse(state.targetResponse);
                const chatName = `DeepSeek - ${jsonData.data.biz_data.chat_session.title || 'Untitled Chat'}`.replace(/[\/\\?%*:|"<>]/g, '-');
                const fileName = `${chatName}_${timestamp}.md`;

                const blob = new Blob([state.convertedMd], { type: 'text/markdown' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = fileName;
                link.click();

                log.info(`成功下载文件: ${fileName}`);
            } catch (e) {
                log.error('下载过程中出错:', e);
                alert('下载过程中发生错误，请查看控制台了解详情。');
            }
        };

        // Direct upload button
        uploadButton.onclick = function() {
            if (!state.targetResponse) {
                alert('还没有发现有效的对话记录。\n请等待目标响应或进行一些对话。');
                return;
            }
            try {
                const originalData = JSON.parse(state.targetResponse);
                const enhancedData = {
                    ...originalData,
                    url: window.location.href,    
                };
                
                // Show upload status
                uploadButton.innerText = '上传中...';
                uploadButton.disabled = true;
                uploadButton.style.backgroundColor = '#cccccc';
                
                // Generate a random key
                const apiKeyParam = 'key_' + Math.random().toString(36).substring(2, 15);
                const finalApiUrl = `${apiUrl}?key=${apiKeyParam}`;
                
                log.info(`正在上传到: ${finalApiUrl}`);
                
                // Send to API with proper CORS handling
                fetch(finalApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(enhancedData),
                    mode: 'cors',
                    credentials: 'omit'
                })
                .then(response => {
                    log.info(`接收到响应，状态: ${response.status}`);
                    
                    // Try to ensure we get JSON or handle errors appropriately
                    const contentType = response.headers.get('Content-Type') || '';
                    if (contentType.includes('application/json')) {
                        return response.json().then(data => {
                            if (!response.ok) {
                                throw new Error(data.error || `Server error: ${response.status}`);
                            }
                            return data;
                        });
                    } else {
                        // Not JSON - try to get the text to see what it is
                        return response.text().then(text => {
                            if (!response.ok) {
                                // For non-OK responses that aren't JSON, create a reasonable error
                                throw new Error(`Server returned non-JSON response: ${text.substring(0, 50)}...`);
                            }
                            
                            // For OK responses that aren't JSON, try to parse as JSON anyway
                            // (in case Content-Type is wrong but content is actually JSON)
                            try {
                                return JSON.parse(text);
                            } catch (e) {
                                throw new Error(`Server returned non-JSON response: ${text.substring(0, 50)}...`);
                            }
                        });
                    }
                })
                .then(data => {
                    if (data.error) {
                        throw new Error(data.error);
                    }
                    
                    // Handle successful upload
                    log.info('上传成功!', data);
                    uploadButton.innerText = '✓ 已上传';
                    uploadButton.style.backgroundColor = '#28a745';
                    
                    // If we have a question ID, provide a link
                    if (data.questionId) {
                        const urlParts = apiUrl.split('/api/');
                        if (urlParts.length > 1) {
                            const baseUrl = urlParts[0];
                            const viewUrl = `${baseUrl}/question/${data.questionId}`;
                            
                            // Show a notification with link
                            const notification = document.createElement('div');
                            Object.assign(notification.style, {
                                position: 'fixed',
                                bottom: '20px',
                                right: '20px',
                                backgroundColor: 'white',
                                color: 'black',
                                padding: '15px',
                                borderRadius: '5px',
                                boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                                zIndex: '10000',
                                maxWidth: '300px'
                            });
                            
                            notification.innerHTML = `
                            <div style="font-weight:bold;margin-bottom:10px;">上传成功!</div>
                            <p>对话已成功上传。</p>
                            <a href="${viewUrl}" target="_blank" style="display:block;text-align:center;background:#007bff;color:white;padding:8px;border-radius:4px;margin-top:10px;text-decoration:none;">查看对话</a>
                            `;
                            
                            document.body.appendChild(notification);
                            
                            // Remove notification after 10 seconds
                            setTimeout(() => {
                                if (document.body.contains(notification)) {
                                    document.body.removeChild(notification);
                                }
                            }, 10000);
                        }
                    }
                    
                    // Reset button after 3 seconds
                    setTimeout(() => {
                        uploadButton.innerText = '上传';
                        uploadButton.disabled = false;
                        uploadButton.style.backgroundColor = '#ff7f00';
                    }, 3000);
                })
                .catch(error => {
                    log.error('上传过程中出错:', error);
                    alert(`上传失败: ${error.message}`);
                    
                    // Reset button
                    uploadButton.innerText = '重试上传';
                    uploadButton.disabled = false;
                    uploadButton.style.backgroundColor = '#dc3545';
                });
                
            } catch (e) {
                log.error('上传准备过程中出错:', e);
                alert('上传过程中发生错误，请查看控制台了解详情。');
                
                // Reset button
                uploadButton.innerText = '上传';
                uploadButton.disabled = false;
                uploadButton.style.backgroundColor = '#ff7f00';
            }
        };

        buttonContainer.appendChild(jsonButton);
        buttonContainer.appendChild(mdButton);
        buttonContainer.appendChild(uploadButton);
        document.body.appendChild(buttonContainer);

        updateButtonStatus();
    }

    function convertJsonToMd(data) {
        let mdContent = [];
        const title = data.data.biz_data.chat_session.title || 'Untitled Chat';
        const totalTokens = data.data.biz_data.chat_messages.reduce((acc, msg) => acc + (msg.accumulated_token_usage || 0), 0);
        mdContent.push(`# DeepSeek - ${title} (Total Tokens: ${totalTokens})\n`);

        data.data.biz_data.chat_messages.forEach(msg => {
            const role = msg.role === 'USER'? 'Human' : 'Assistant';
            mdContent.push(`### ${role}`);

            const timestamp = msg.inserted_at ? new Date(msg.inserted_at * 1000).toISOString() : new Date().toISOString();
            mdContent.push(`*${timestamp}*\n`);

            if (msg.files && msg.files.length > 0) {
                msg.files.forEach(file => {
                    const insertTime = new Date(file.inserted_at * 1000).toISOString();
                    const updateTime = new Date(file.updated_at * 1000).toISOString();
                    mdContent.push(`### File Information`);
                    mdContent.push(`- Name: ${file.file_name}`);
                    mdContent.push(`- Size: ${file.file_size} bytes`);
                    mdContent.push(`- Token Usage: ${file.token_usage}`);
                    mdContent.push(`- Upload Time: ${insertTime}`);
                    mdContent.push(`- Last Update: ${updateTime}\n`);
                });
            }

            let content = msg.content;

            if (msg.search_results && msg.search_results.length > 0) {
                const citations = {};
                msg.search_results.forEach((result, index) => {
                    if (result.cite_index !== null) {
                        citations[result.cite_index] = result.url;
                    }
                });
                content = content.replace(/\[citation:(\d+)\]/g, (match, p1) => {
                    const url = citations[parseInt(p1)];
                    return url? ` [${p1}](${url})` : match;
                });
                content = content.replace(/\s+,/g, ',').replace(/\s+\./g, '.');
            }

            if (msg.thinking_content) {
                const thinkingTime = msg.thinking_elapsed_secs? `(${msg.thinking_elapsed_secs}s)` : '';
                content += `\n\n**Thinking Process ${thinkingTime}:**\n${msg.thinking_content}`;
            }

            content = content.replace(/\$\$(.*?)\$\$/gs, (match, formula) => {
                return formula.includes('\n')? `\n$$\n${formula}\n$$\n` : `$$${formula}$$`;
            });

            mdContent.push(content + '\n');
        });

        return mdContent.join('\n');
    }

    const hookXHR = () => {
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(...args) {
          if (args[1] && typeof args[1] === 'string' && args[1].includes('history_messages?chat_session_id') && args[1].includes('&cache_version=')) {
            args[1] = args[1].split('&cache_version=')[0];
          }
          this.addEventListener('load', function() {
            if (this.responseURL && this.responseURL.includes('history_messages?chat_session_id')) {
                processTargetResponse(this.responseText, this.responseURL);
            }
          });
          originalOpen.apply(this, args);
        };
    };
    hookXHR();

    window.addEventListener('load', function() {
        createDownloadButtons();

        const observer = new MutationObserver(() => {
            if (!document.getElementById('downloadJsonButton') || !document.getElementById('downloadMdButton') || !document.getElementById('uploadButton')) {
                log.info('检测到按钮丢失，正在重新创建...');
                createDownloadButtons();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        log.info('DeepSeek 上传脚本已启动');
    });
})();
