
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, Check, Tag, X, PlusCircle, Share2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { DeepSeekData } from '@/lib/types';

interface ChatMessage {
  message_id: number;
  role: string;
  content: string;
}

interface ParsedJson {
  title: string;
  userQuestions: string[];
  aiAnswers: string[];
  url?: string;
}

const JsonUploader = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedJson | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setParsedData(null);
      setTags([]);
    }
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (tags.includes(tagInput.trim())) {
      toast.error('Tag already exists');
      return;
    }
    if (tags.length >= 5) {
      toast.error('Maximum 5 tags allowed');
      return;
    }
    setTags([...tags, tagInput.trim()]);
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const parseJsonFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a JSON file first');
      return;
    }

    try {
      setIsUploading(true);
      const fileContent = await selectedFile.text();
      const jsonData = JSON.parse(fileContent);

      // Extract data according to the specified format
      const chatSession = jsonData?.data?.biz_data?.chat_session;
      const chatMessages = jsonData?.data?.biz_data?.chat_messages;

      if (!chatSession || !chatMessages || !Array.isArray(chatMessages)) {
        throw new Error('Invalid JSON format');
      }

      const title = chatSession.title || 'Untitled Conversation';
      const url = jsonData?.url;
      
      // Extract user questions and AI answers
      const userQuestions: string[] = [];
      const aiAnswers: string[] = [];
      
      chatMessages.forEach((message: ChatMessage) => {
        if (message.role === 'USER' && message.content) {
          userQuestions.push(message.content);
        } else if (message.role === 'ASSISTANT' && message.content) {
          aiAnswers.push(message.content);
        }
      });

      if (userQuestions.length === 0) {
        throw new Error('No user questions found in the JSON file');
      }

      setParsedData({ title, userQuestions, aiAnswers, url });
      toast.success('JSON file parsed successfully');
    } catch (error: any) {
      toast.error(`Error parsing JSON: ${error.message}`);
      console.error('Error parsing JSON:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!parsedData) {
      toast.error('Please parse a JSON file first');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to submit a question');
      return;
    }

    if (tags.length === 0) {
      toast.error('Please add at least one tag');
      return;
    }

    try {
      setIsUploading(true);
      
      // Submit to Supabase - using custom tags instead of default ones
      const { data, error } = await supabase
        .from('questions')
        .insert({
          title: parsedData.title,
          content: parsedData.userQuestions,
          answer: parsedData.aiAnswers,
          tags: tags,
          author_id: user.id,
          url: parsedData.url
        })
        .select();
      
      if (error) throw error;
      
      toast.success('Your question has been submitted successfully!');
      
      // Reset state
      setSelectedFile(null);
      setParsedData(null);
      setTags([]);
      
      // Navigate to the newly created question
      setTimeout(() => {
        if (data && data[0]) {
          navigate(`/question/${data[0].id}`);
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (error: any) {
      toast.error(`Error submitting question: ${error.message}`);
      console.error('Error submitting question:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Generate the Tampermonkey script with updated content
  const generateTampermonkeyScript = () => {
    return `// ==UserScript==
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

    // Configuration
    const SUPABASE_URL = "https://ejoiyuobalmjfvgzsclq.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqb2l5dW9iYWxtamZ2Z3pzY2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjExODAsImV4cCI6MjA1ODM5NzE4MH0.nGz3SO8Gtvnj7o5VDkF6J5MrGKnZ3K2JLCjs8n8-ie8";
    
    // Authentication - Set these variables for authentication
    // Either set default values here or leave empty and prompt the user
    let userEmail = '';
    let userPassword = '';

    // State management
    let state = {
        targetResponse: null,
        lastUpdateTime: null,
        convertedMd: null,
        isAuthenticated: false,
        session: null
    };

    // Basic logging utility
    const log = {
        info: (msg) => console.log(\`[DeepSeek Uploader] \${msg}\`),
        error: (msg, e) => console.error(\`[DeepSeek Uploader] \${msg}\`, e)
    };

    // Pattern to identify the chat session
    const targetUrlPattern = /chat_session_id=/;

    // Simple Supabase client implementation
    const supabase = {
        auth: {
            signIn: async (email, password) => {
                try {
                    const response = await fetch(\`\${SUPABASE_URL}/auth/v1/token?grant_type=password\`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'apikey': SUPABASE_KEY,
                        },
                        body: JSON.stringify({ email, password })
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error_description || 'Sign in failed');
                    }
                    
                    const data = await response.json();
                    return { 
                        data: { 
                            session: {
                                access_token: data.access_token,
                                refresh_token: data.refresh_token,
                                user: data.user
                            }
                        }, 
                        error: null 
                    };
                } catch (error) {
                    return { data: null, error };
                }
            },
            getSession: () => {
                // Check localStorage for session
                try {
                    const storedSession = localStorage.getItem('supabase.auth.token');
                    if (storedSession) {
                        const session = JSON.parse(storedSession);
                        return { data: { session }, error: null };
                    }
                } catch (e) {
                    log.error('Error retrieving session', e);
                }
                return { data: { session: null }, error: null };
            }
        },
        from: (table) => {
            return {
                insert: async (records) => {
                    try {
                        // Get the current session
                        const { data: { session } } = state.session ? { data: { session: state.session } } : supabase.auth.getSession();
                        
                        if (!session) {
                            return { data: null, error: new Error('Authentication required') };
                        }
                        
                        const response = await fetch(\`\${SUPABASE_URL}/rest/v1/\${table}\`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'apikey': SUPABASE_KEY,
                                'Authorization': \`Bearer \${session.access_token}\`,
                                'Prefer': 'return=representation'
                            },
                            body: JSON.stringify(records)
                        });
                        
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || \`Failed to insert into \${table}\`);
                        }
                        
                        const data = await response.json();
                        return { data, error: null };
                    } catch (error) {
                        return { data: null, error };
                    }
                }
            };
        }
    };

    // Process and store the target response
    function processTargetResponse(text, url) {
        try {
            if (targetUrlPattern.test(url)) {
                state.targetResponse = text;
                state.lastUpdateTime = new Date().toLocaleTimeString();
                updateButtonStatus();
                log.info(\`成功捕获目标响应 (\${text.length} bytes) 来自: \${url}\`);

                state.convertedMd = convertJsonToMd(JSON.parse(text));
                log.info('成功将JSON转换为Markdown');
            }
        } catch (e) {
            log.error('处理目标响应时出错:', e);
        }
    }

    // Update the button status based on current state
    function updateButtonStatus() {
        const jsonButton = document.getElementById('downloadJsonButton');
        const mdButton = document.getElementById('downloadMdButton');
        const uploadButton = document.getElementById('uploadButton');
        const loginButton = document.getElementById('loginButton');
        
        if (jsonButton && mdButton && uploadButton && loginButton) {
            const hasResponse = state.targetResponse !== null;
            jsonButton.style.backgroundColor = hasResponse ? '#28a745' : '#007bff';
            mdButton.style.backgroundColor = state.convertedMd ? '#28a745' : '#007bff';
            uploadButton.style.backgroundColor = hasResponse ? '#ff7f00' : '#007bff';
            loginButton.style.backgroundColor = state.isAuthenticated ? '#28a745' : '#dc3545';
            
            const statusText = hasResponse 
                ? \`最后更新: \${state.lastUpdateTime}\\n数据已准备好\` 
                : '等待目标响应中...';
            
            const loginStatus = state.isAuthenticated 
                ? '已登录' 
                : '未登录 - 点击登录';
            
            jsonButton.title = statusText;
            mdButton.title = statusText;
            uploadButton.title = statusText;
            loginButton.title = loginStatus;
            loginButton.innerText = state.isAuthenticated ? '已登录' : '登录';
        }
    }

    // Create UI elements for interaction
    function createDownloadButtons() {
        const buttonContainer = document.createElement('div');
        const jsonButton = document.createElement('button');
        const mdButton = document.createElement('button');
        const uploadButton = document.createElement('button');
        const loginButton = document.createElement('button');

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
        loginButton.id = 'loginButton';
        loginButton.innerText = '登录';

        Object.assign(jsonButton.style, buttonStyles);
        Object.assign(mdButton.style, buttonStyles);
        Object.assign(uploadButton.style, { ...buttonStyles, backgroundColor: '#ff7f00' });
        Object.assign(loginButton.style, { ...buttonStyles, backgroundColor: '#dc3545' });

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
            el.style.transform = \`translate(\${xPos}px, \${yPos}px)\`;
        }

        // Login button functionality
        loginButton.onclick = async function() {
            try {
                if (state.isAuthenticated) {
                    // Show currently logged in status
                    alert('您已登录。如需重新登录，请刷新页面。');
                    return;
                }
                
                // Check if we have stored credentials first
                const email = userEmail || localStorage.getItem('deepseek_uploader_email') || prompt('请输入您的电子邮件地址:');
                if (!email) return;
                
                const password = userPassword || localStorage.getItem('deepseek_uploader_password') || prompt('请输入您的密码:');
                if (!password) return;
                
                // Show login in progress
                loginButton.innerText = '登录中...';
                loginButton.disabled = true;
                
                // Try to sign in
                const { data, error } = await supabase.auth.signIn(email, password);
                
                if (error) {
                    alert(\`登录失败: \${error.message}\`);
                    loginButton.innerText = '登录';
                    loginButton.disabled = false;
                    loginButton.style.backgroundColor = '#dc3545';
                    return;
                }
                
                // Store session and update state
                state.session = data.session;
                state.isAuthenticated = true;
                
                // Save credentials if user wants to
                if (confirm('是否保存登录凭据？（仅保存在本地浏览器中）')) {
                    localStorage.setItem('deepseek_uploader_email', email);
                    localStorage.setItem('deepseek_uploader_password', password);
                }
                
                // Store session in localStorage
                localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
                
                // Update UI
                loginButton.innerText = '已登录';
                loginButton.style.backgroundColor = '#28a745';
                updateButtonStatus();
                
                alert('登录成功！');
            } catch (e) {
                log.error('登录过程中出错:', e);
                alert(\`登录过程中出错: \${e.message}\`);
                loginButton.innerText = '登录';
                loginButton.disabled = false;
                loginButton.style.backgroundColor = '#dc3545';
            }
        };

        // JSON download button
        jsonButton.onclick = function() {
            if (!state.targetResponse) {
                alert('还没有发现有效的对话记录。\\n请等待目标响应或进行一些对话。');
                return;
            }
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                const originalData = JSON.parse(state.targetResponse);
                const enhancedData = {
                    ...originalData,
                    url: window.location.href,    
                };
                const chatName = \`DeepSeek - \${enhancedData.data.biz_data.chat_session.title || 'Untitled Chat'}\`.replace(/[\\/\\\\?%*:|"<>]/g, '-');
                const fileName = \`\${chatName}_\${timestamp}.json\`;

                const blob = new Blob([JSON.stringify(enhancedData)], { type: 'application/json' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = fileName;
                link.click();

                log.info(\`成功下载文件: \${fileName}\`);
            } catch (e) {
                log.error('下载过程中出错:', e);
                alert('下载过程中发生错误，请查看控制台了解详情。');
            }
        };

        // Markdown download button
        mdButton.onclick = function() {
            if (!state.convertedMd) {
                alert('还没有发现有效的对话记录。\\n请等待目标响应或进行一些对话。');
                return;
            }
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                const jsonData = JSON.parse(state.targetResponse);
                const chatName = \`DeepSeek - \${jsonData.data.biz_data.chat_session.title || 'Untitled Chat'}\`.replace(/[\\/\\\\?%*:|"<>]/g, '-');
                const fileName = \`\${chatName}_\${timestamp}.md\`;

                const blob = new Blob([state.convertedMd], { type: 'text/markdown' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = fileName;
                link.click();

                log.info(\`成功下载文件: \${fileName}\`);
            } catch (e) {
                log.error('下载过程中出错:', e);
                alert('下载过程中发生错误，请查看控制台了解详情。');
            }
        };

        // Direct upload to Supabase button
        uploadButton.onclick = async function() {
            if (!state.targetResponse) {
                alert('还没有发现有效的对话记录。\\n请等待目标响应或进行一些对话。');
                return;
            }
            
            // Check authentication
            if (!state.isAuthenticated) {
                const shouldLogin = confirm('您尚未登录。需要先登录才能上传内容。是否现在登录？');
                if (shouldLogin) {
                    loginButton.click();
                }
                return;
            }
            
            try {
                const originalData = JSON.parse(state.targetResponse);
                const sourceUrl = window.location.href;
                
                // Extract data from the DeepSeek response
                const chatSession = originalData.data.biz_data.chat_session;
                const chatMessages = originalData.data.biz_data.chat_messages;
                
                if (!chatSession || !chatMessages || !Array.isArray(chatMessages)) {
                    alert('数据格式无效：无法找到对话信息。');
                    return;
                }
                
                const title = chatSession.title || 'Untitled Conversation';
                
                // Extract user questions and AI answers
                const userQuestions = [];
                const aiAnswers = [];
                
                chatMessages.forEach(message => {
                    if (message.role === 'USER' && message.content) {
                        userQuestions.push(message.content);
                    } else if (message.role === 'ASSISTANT' && message.content) {
                        aiAnswers.push(message.content);
                    }
                });
                
                if (userQuestions.length === 0) {
                    alert('未在数据中找到用户问题。');
                    return;
                }
                
                // Default tags
                const defaultTags = ["deepseek", "ai-conversation"];
                
                // Show upload status
                uploadButton.innerText = '上传中...';
                uploadButton.disabled = true;
                uploadButton.style.backgroundColor = '#cccccc';
                
                // Submit to Supabase directly
                log.info('正在提交到Supabase...');
                
                const { data, error } = await supabase.from('questions').insert({
                    title,
                    content: userQuestions,
                    answer: aiAnswers,
                    tags: defaultTags,
                    author_id: state.session.user.id,
                    url: sourceUrl
                });
                
                if (error) {
                    throw error;
                }
                
                log.info('问题成功提交！', data);
                uploadButton.innerText = '✓ 已上传';
                uploadButton.style.backgroundColor = '#28a745';
                
                // Display success notification
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
                
                notification.innerHTML = \`
                <div style="font-weight:bold;margin-bottom:10px;">上传成功!</div>
                <p>对话已成功上传。</p>
                \`;
                
                document.body.appendChild(notification);
                
                // Remove notification after 10 seconds
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 10000);
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    uploadButton.innerText = '上传';
                    uploadButton.disabled = false;
                    uploadButton.style.backgroundColor = '#ff7f00';
                }, 3000);
                
            } catch (error) {
                log.error('上传过程中出错:', error);
                
                // Format error message
                let errorMessage = '上传失败';
                if (error.message) {
                    errorMessage += ': ' + error.message;
                } else if (typeof error === 'object') {
                    errorMessage += ': ' + JSON.stringify(error);
                }
                
                alert(errorMessage);
                
                // Reset button
                uploadButton.innerText = '重试上传';
                uploadButton.disabled = false;
                uploadButton.style.backgroundColor = '#dc3545';
            }
        };

        buttonContainer.appendChild(loginButton);
        buttonContainer.appendChild(jsonButton);
        buttonContainer.appendChild(mdButton);
        buttonContainer.appendChild(uploadButton);
        document.body.appendChild(buttonContainer);

        // Check if we're already authenticated on startup
        checkAuthentication();
        updateButtonStatus();
    }

    // Check if user is already authenticated
    async function checkAuthentication() {
        try {
            const { data: { session }, error } = supabase.auth.getSession();
            
            if (error) {
                log.error('检查认证状态时出错:', error);
                return;
            }
            
            if (session) {
                state.session = session;
                state.isAuthenticated = true;
                updateButtonStatus();
                log.info('已检测到现有会话，用户已登录');
            } else {
                log.info('无现有会话，用户未登录');
            }
        } catch (e) {
            log.error('检查认证状态时发生错误:', e);
        }
    }

    // Convert JSON to Markdown format
    function convertJsonToMd(data) {
        let mdContent = [];
        const title = data.data.biz_data.chat_session.title || 'Untitled Chat';
        const totalTokens = data.data.biz_data.chat_messages.reduce((acc, msg) => acc + (msg.accumulated_token_usage || 0), 0);
        mdContent.push(\`# DeepSeek - \${title} (Total Tokens: \${totalTokens})\n\`);

        data.data.biz_data.chat_messages.forEach(msg => {
            const role = msg.role === 'USER'? 'Human' : 'Assistant';
            mdContent.push(\`### \${role}\`);

            const timestamp = msg.inserted_at ? new Date(msg.inserted_at * 1000).toISOString() : new Date().toISOString();
            mdContent.push(\`*\${timestamp}*\n\`);

            if (msg.files && msg.files.length > 0) {
                msg.files.forEach(file => {
                    const insertTime = new Date(file.inserted_at * 1000).toISOString();
                    const updateTime = new Date(file.updated_at * 1000).toISOString();
                    mdContent.push(\`### File Information\`);
                    mdContent.push(\`- Name: \${file.file_name}\`);
                    mdContent.push(\`- Size: \${file.file_size} bytes\`);
                    mdContent.push(\`- Token Usage: \${file.token_usage}\`);
                    mdContent.push(\`- Upload Time: \${insertTime}\`);
                    mdContent.push(\`- Last Update: \${updateTime}\n\`);
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
                content = content.replace(/\\[citation:(\\d+)\\]/g, (match, p1) => {
                    const url = citations[parseInt(p1)];
                    return url? \` [\${p1}](\${url})\` : match;
                });
                content = content.replace(/\\s+,/g, ',').replace(/\\s+\\./g, '.');
            }

            if (msg.thinking_content) {
                const thinkingTime = msg.thinking_elapsed_secs? \`(\${msg.thinking_elapsed_secs}s)\` : '';
                content += \`\n\n**Thinking Process \${thinkingTime}:**\n\${msg.thinking_content}\`;
            }

            content = content.replace(/\\$\\$(.*?)\\$\\$/gs, (match, formula) => {
                return formula.includes('\\n')? \`\n$$\n\${formula}\n$$\n\` : \`$$\${formula}$$\`;
            });

            mdContent.push(content + '\n');
        });

        return mdContent.join('\n');
    }

    // Hook into XHR to capture DeepSeek's responses
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

    // Initialize everything when the window loads
    window.addEventListener('load', function() {
        createDownloadButtons();

        // Observe DOM for changes to re-add buttons if needed
        const observer = new MutationObserver(() => {
            if (!document.getElementById('downloadJsonButton') || 
                !document.getElementById('downloadMdButton') || 
                !document.getElementById('uploadButton') || 
                !document.getElementById('loginButton')) {
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
})();`;
  };

  // Copy Tampermonkey script to clipboard
  const copyTampermonkeyScript = () => {
    navigator.clipboard.writeText(generateTampermonkeyScript());
    toast.success('Tampermonkey script copied to clipboard');
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
        Upload Conversation JSON
      </h2>
      
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <input
            type="file"
            id="json-file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <label 
            htmlFor="json-file"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {selectedFile ? selectedFile.name : 'Select or drop a JSON file'}
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : 'JSON files only (.json)'}
            </p>
          </label>
        </div>
        
        {selectedFile && !parsedData && (
          <Button 
            onClick={parseJsonFile} 
            className="w-full"
            disabled={isUploading}
          >
            <FileText className="mr-2 h-5 w-5" />
            {isUploading ? 'Parsing...' : 'Parse JSON File'}
          </Button>
        )}
        
        {parsedData && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">Extracted Data</h3>
              <div className="space-y-2">
                <p><span className="font-semibold">Title:</span> {parsedData.title}</p>
                <p><span className="font-semibold">Questions:</span> {parsedData.userQuestions.length}</p>
                <p><span className="font-semibold">Answers:</span> {parsedData.aiAnswers.length}</p>
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (max 5)
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  id="tags"
                  placeholder="Add tags..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleAddTag}
                  size="icon"
                >
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div 
                    key={tag} 
                    className="flex items-center bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm dark:bg-gray-700 dark:text-gray-200"
                  >
                    <span>{tag}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={isUploading || tags.length === 0}
            >
              <Check className="mr-2 h-5 w-5" />
              {isUploading ? 'Submitting...' : 'Submit Question'}
            </Button>
          </div>
        )}
        
        {/* Direct Upload with DeepSeek Section - Updated without API key */}
        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Direct Upload with DeepSeek
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white">DeepSeek Tampermonkey Script</h4>
                <Button 
                  onClick={copyTampermonkeyScript}
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  Copy Script
                </Button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <ol className="list-decimal ml-5 space-y-4 text-gray-700 dark:text-gray-300">
                  <li>Install the Tampermonkey browser extension if you don't have it already</li>
                  <li>Create a new script in Tampermonkey</li>
                  <li>Copy and paste the script using the button above</li>
                  <li>Save the script and enable it</li>
                  <li>Navigate to <a href="https://chat.deepseek.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">chat.deepseek.com</a> and you'll see new upload buttons</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonUploader;
