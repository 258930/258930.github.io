document.addEventListener('DOMContentLoaded', () => {
    // 全局状态管理（简化：只关注扣分，不再按分项存分数）
    const state = {
        totalDeduction: 0,    // 总扣分数（核心：所有扣分累加）
        details: [],          // 扣分详情
        prepared: false,      // 是否完成清点（仅正确清点后为true）
        step: 0,              // 实验步骤：0-准备 1-放木板 2-放叶片 3-放双面刀片 4-切割中 5-清水 6-毛笔 7-显微镜
        bladeCount: 0,        // 双面刀片数量（需1个）
        isDipped: false,      // 双面刀片是否已蘸水（每次切割前需重新蘸水）
        focusLevel: 0,        // 显微镜调焦等级（0模糊→5清晰）
        hasFocusDeducted: false,// 标记调焦过度是否已扣分（避免重复扣）
        cutCount: 0,
        hasDish: false,
        canDragToolsAfterDip: false,
        lastAction: "",
        hasCut :false,
        microStep: 0, // 显微镜操作步骤：0-初始 1-粗准焦上升 2-转换器完成 3-反光镜完成 4-载玻片完成 5-粗准焦下降 6-细准焦完成
    coarseFocusClickCount: 0, // 粗准焦螺旋点击次数（0-未点击 1-第一次 2-第二次）
    isCoarseBtnDisabled: false, // 粗准焦按钮是否禁用
    isFineBtnDisabled: true, // 细准焦按钮是否禁用
    isRevolverBtnDisabled: false, // 转换器按钮是否禁用
    isMirrorBtnDisabled: false, // 反光镜按钮是否禁用
    isSlidePlaceBtnDisabled: false,// 载玻片放置按钮是否禁用
     hasShownQuiz: {
        1: false, // 单双面刀片
        2: false, // 切割蘸水
        3: false, // 纱布
        4: false, // 毛笔
        5: false, // 盖玻片
        6: false  // 显微镜
    }
    };
// 实验题库（按数字分类，可扩展）
  const questionBank = {
        1: [ // 分类1：单双面刀片
            // {
            //     id: 101,
            //     title: "制作叶片切片时，切割前刀片必须蘸水的目的是？",
            //     options: [
            //         "A. 防止刀片生锈",
            //         "B. 使切下的薄片粘在刀片上，避免散落",
            //         "C. 润滑刀片，切割更省力",
            //         "D. 清洁刀片"
            //     ],
            //     answer: "B"
            // },
            {
                id: 102,
                type: 'image', // 图片题标识
                src: "./daopianti.png", // 图片地址
                title: "请选出正确答案",
                answer: "B" // 标准答案
            }
        ],
        2: [ // 分类2：切割蘸水
            {
                id: 201,
                title: "在“观察叶片的主要组织”实验中，切割叶片的正确方法是（  ）",
                options: [
                    "A. 用一片刀片沿叶的纵向迅速切割",
                    "B. 用并排的两片刀片沿叶片的横向缓慢切割",
                    "C. 用并排的两片刀片沿叶的纵向迅速切割",
                    "D. 用并排的两片刀片沿叶片的横向迅速切割"
                ],
                answer: "D"
            },
            {
                id: 202,
                // type: 'image',
                // src: "https://via.placeholder.com/600x400?text=显微镜粗准焦操作图",
                title: "在制作叶横切面的临时切片时，正确的切割方法是刀片蘸水后（　）",
                 options: [
                    "A. 迅速地切割",
                    "B. 缓慢地切下",
                    "C. 迅速地来回切拉",
                    "D. 缓慢地来回切拉"
                ],
                answer: "A"
            },
            {
                id: 203,
                type: 'image',
                src: "./qiegeti.png",
                title: "请选出正确答案",
                answer: "D"
            },
             {
                id: 204,
              title: "在“观察叶片的结构”实验里，徒手切片的过程中，每切一次叶片，刀片都要蘸一下水。蘸水的目的是（　）",
                 options: [
                    "A. 使刀片更加锋利",
                    "B. 可以捏得更紧",
                    "C. 把切下的薄片放入水中",
                    "D. 检查有没有切下的叶片"
                ],
                answer: "C"
            }
        ],
        3: [ // 分类3：纱布
            {
                id: 301,
                title: "擦载玻片和盖玻片时用一手食指和拇指夹住玻片的两边，另一手食指和拇指包住纱布，同时擦到玻片的两面，用力要均匀",
                options: [
                    "A. 正确",
                    "B. 错误",
                   
                ],
                answer: "A"
            }
        ],
        4: [ // 分类4：毛笔
            {
                id: 401,
                type: 'image',
                src: "./maobiti.png",
                title: "请选出正确答案",
                answer: "D"
            }
        ],
        5: [ // 分类5：盖玻片
            {
                id: 501,
                title: "盖盖玻片时，使盖玻片的一边先接触载玻片上的液滴，然后向标本所在的方向缓缓地放下——避免标本被挤出盖玻片（避免出现气泡）",
                options: [
                    "A. 正确",
                    "B. 错误",
                ],
                answer: "A"
            },
              {
                id: 502,
               type: 'image',
                src: "./gaibopian.png",
                title: "请选出正确答案",
                answer: "C"
            }
        ],
        6: [ // 分类6：显微镜
              {
                 id: 601,
                 title: "取镜时，双手握住镜臂，再将显微镜放在试验台正中央处（实验台中央略偏左）",
                options: [
                    "A. 正确",
                    "B. 错误",
                ],
                answer: "A"
            },
             {
                 id: 602,
               type: 'image',
                src: "./xianweijingqufang.png",
                title: "请选出正确答案",
                answer: "D"
            }
        ]
    };
const RANDOM_QUESTION_COUNT = 1;
// 新增答题相关状态
state.isAnswering = false; // 是否正在答题（禁用实验操作）
state.currentQuestions = []; // 当前随机抽取的题目
state.answeredCount = 0; // 已答对的题目数
     const dish = document.getElementById('dip-water-dish');
    const waterTool = document.getElementById('tool-water');
        // ========== 新增：工具坐标配置（匹配你CSS里的初始位置） ==========
    const toolPositions = {
        '纱布': { x: 400, y: 200 },    // 对应CSS里#tool-gauze的left/top
        '盖玻片': { x: 320, y: 200 },  // 对应CSS里#tool-coverslide的left/top
        '载玻片': { x: 200, y: 200 }   // 对应CSS里#tool-slide的left/top
    };
function shuffleArray(array) {
    // 深拷贝原数组，避免修改原数组
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
    // DOM元素获取
    const logPanel = document.getElementById('logPanel');
    const stage = document.getElementById('mainStage');
    const guide = document.getElementById('topGuide');
    const shelf = document.getElementById('shelf');
    const restartBtn = document.getElementById('restartBtn');
    const closeReportBtn = document.getElementById('closeReportBtn');
    const btnDipWater = document.getElementById('btnDipWater');
    const btnCut = document.getElementById('btnCut');
    const leafItem = document.getElementById('leaf-on-wood');
    const blade1 = document.querySelector('.blade.b1');
    const blade2 = document.querySelector('.blade.b2');
    const cutButtons = document.getElementById('cut-buttons');

    // 核心器材列表（必需+干扰项）
    const requiredEquips = ['小木板', '新鲜菠菜叶片', '双面刀片', '清水', '毛笔', '显微镜', '载玻片','镊子','纱布','盖玻片','培养皿（内含清水）']; // 必需器材
    const distractEquips = ['酒精灯', '试管', '火柴','单面刀片']; // 干扰项
    const allEquipsForCheck = [...requiredEquips, ...distractEquips]; // 清点时显示的所有器材

    // 1. 初始化器材架：仅正确清点后显示，且只显示必需器材
function initShelf() {
    shelf.innerHTML = '';
    // 关键修改：先打乱必需器材的顺序，再生成器材架
    const shuffledRequired = shuffleArray(requiredEquips);
    // 遍历打乱后的必需器材
    shuffledRequired.forEach(name => {
        const item = document.createElement('div');
        item.className = 'instrument';
        item.draggable = true;
        item.innerText = name;
        // 拖拽开始：传递器材名称
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text', name);
            item.style.opacity = '0.7';
        });
        // 拖拽结束：恢复样式
        item.addEventListener('dragend', () => {
            item.style.opacity = '1';
        });
        shelf.appendChild(item);
    });
}
    // 2. 舞台拖拽逻辑：接收器材并执行实验步骤
    stage.addEventListener('dragover', (e) => e.preventDefault());
    stage.addEventListener('drop', (e) => {
        const name = e.dataTransfer.getData('text');
        handleExperimentLogic(name);
    });

function showTool(name) {
    console.log("【调试】开始处理工具显示：", name);
    

    // 2. 显示对应工具
    switch (name) {
        case '镊子':
            document.getElementById('dip-water-dish').classList.remove('hidden');
            document.getElementById('tool-forceps').classList.remove('hidden');
            break;
        case '载玻片':
            document.getElementById('dip-water-dish').classList.remove('hidden');
            document.getElementById('tool-slide').classList.remove('hidden');
            break;
        case '盖玻片':
             document.getElementById('dip-water-dish').classList.remove('hidden');
            document.getElementById('tool-coverslide').classList.remove('hidden');
            break;
        case '纱布':
             document.getElementById('dip-water-dish').classList.remove('hidden');
            document.getElementById('tool-gauze').classList.remove('hidden');
            break;
        case '毛笔':
             document.getElementById('dip-water-dish').classList.remove('hidden');
            document.getElementById('brush-tool').classList.remove('hidden');
            break;
        case '清水':
             document.getElementById('dip-water-dish').classList.remove('hidden');
            document.getElementById('tool-water').classList.remove('hidden');
            break;
        default:
            console.warn("【警告】未知工具：", name);
            break;
            
    }
    document.getElementById('dip-water-dish').classList.remove('hidden');
}
// ==========================
// 【通用操作视频弹窗】
// @param {string} videoSrc - 视频文件路径
// @param {string} title - 弹窗标题
// @param {number} category - 题目分类
// @param {function} callback - 视频关闭后的回调函数（可选）
// ==========================
// ==========================
function showOperationVideoModal(videoSrc, title, category, callback = null) {
    // 如果该类题目已经弹过，直接返回（避免重复）
    // if (state.hasShownQuiz[category]) {
    //     return;
    // }
    
    let videoModal = document.getElementById('operation-video-modal');
    if (videoModal) {
        videoModal.remove();
    }

    videoModal = document.createElement('div');
    videoModal.id = 'operation-video-modal';
    videoModal.className = 'modal';
    
    videoModal.style.cssText = `
        display: flex;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        z-index: 10000;
        justify-content: center;
        align-items: center;
    `;
    
    videoModal.innerHTML = `
        <div class="modal-content" style="max-width: 900px; width: 90%; background: white; border-radius: 8px; padding: 20px; position: relative; z-index: 10001;">
            <h3>🎬 ${title}</h3>
            <div style="position: relative; padding-bottom: 56.25%; height: 0; margin:15px 0;">
                <video id="operation-video" style="position:absolute; top:0; left:0; width:100%; height:100%; border-radius:8px;" controls autoplay>
                    <source src="${videoSrc}" type="video/mp4">
                </video>
            </div>
            <button id="close-operation-video" class="btn-blue" style="padding: 10px 20px; font-size: 16px;">关闭视频，开始答题</button>
        </div>
    `;
    
    document.body.appendChild(videoModal);
    videoModal.style.display = 'flex';

    // 移除旧的事件监听器，使用新的事件处理
    const closeBtn = document.getElementById('close-operation-video');
    // 移除可能存在的旧监听器
    closeBtn.replaceWith(closeBtn.cloneNode(true));
    const newCloseBtn = document.getElementById('close-operation-video');
    
    newCloseBtn.onclick = () => {
        const video = document.getElementById('operation-video');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }
        videoModal.style.display = 'none';
        videoModal.remove();
        
        // 视频关闭后弹出对应分类的题目
        // 注意：这里直接调用 showQuizModal，但 showQuizModal 内部会检查 hasShownQuiz
        // 所以需要先标记该类为已弹过，否则 showQuizModal 会直接返回
        if (callback) {
            callback();
        } else {
            // 先标记该类已弹过，再显示题目
            //state.hasShownQuiz[category] = true;
            showQuizModal(category);
        }
    };
}
// ==========================
// 【清点器材专用视频】qingdian.mp4
// ==========================
function showCheckVideoModal() {
  let videoModal = document.getElementById('check-video-modal');
  if (videoModal) {
    videoModal.remove();
  }

  videoModal = document.createElement('div');
  videoModal.id = 'check-video-modal';
  videoModal.className = 'modal';
  videoModal.innerHTML = `
    <div class="modal-content" style="max-width: 900px; width: 90%;">
      <h3>🎬 器材清点教学视频</h3>
      <div style="position: relative; padding-bottom: 56.25%; height: 0; margin:15px 0;">
        <video id="check-video" style="position:absolute; top:0; left:0; width:100%; height:100%; border-radius:8px;" autoplay controls>
          <source src="qingdian.mp4" type="video/mp4">
        </video>
      </div>
      <button id="close-check-video" class="btn-blue">关闭视频，开始清点</button>
    </div>
  `;
  document.body.appendChild(videoModal);
  videoModal.style.display = 'flex';

  document.getElementById('close-check-video').onclick = () => {
    // 获取视频元素并停止播放
    const video = document.getElementById('check-video');
    if (video) {
      video.pause(); // 暂停视频
      video.currentTime = 0; // 重置到开始位置
      video.muted = true; // 可选：静音
    }
    videoModal.style.display = 'none';
  };
}

// ==========================
// 【实验操作专用视频】caozuo.mp4（支持回调）
// ==========================
function showUseVideoModal(callback = null) {
  let videoModal = document.getElementById('use-video-modal');
  if (videoModal) {
    videoModal.remove();
  }

  videoModal = document.createElement('div');
  videoModal.id = 'use-video-modal';
  videoModal.className = 'modal';
  videoModal.innerHTML = `
    <div class="modal-content" style="max-width: 900px; width: 90%;">
      <h3>🎬 实验操作教学视频</h3>
      <div style="position: relative; padding-bottom: 56.25%; height: 0; margin:15px 0;">
        <video id="use-video" style="position:absolute; top:0; left:0; width:100%; height:100%; border-radius:8px;" controls autoplay>
          <source src="caozuo.mp4" type="video/mp4">
        </video>
      </div>
      <button id="close-use-video" class="btn-blue">关闭视频，开始实验</button>
    </div>
  `;
  document.body.appendChild(videoModal);
  videoModal.style.display = 'flex';

  document.getElementById('close-use-video').onclick = () => {
    // 获取视频元素并停止播放
    const video = document.getElementById('use-video');
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    videoModal.style.display = 'none';
    
    // 执行回调函数（如果存在）
    if (callback) {
      callback();
    } else {
      // 原来的逻辑：直接弹出题目
      showQuizModal(1);
    }
  };
}
    // 核心实验逻辑处理
    function handleExperimentLogic(name) {
        // 未正确清点器材不能操作
        if (!state.prepared) {
          handleErrorWithVideo('qingdian.mp4', '器材清点教学', 1); // 先弹视频
            return addLog("❌ 请先完成「清点器材」步骤（需选对所有必需器材）！");
        }
         const tools = [
            '载玻片',
            '镊子',
            '纱布',
            '盖玻片',
            '毛笔',
            '清水'
        ];
        // ========== 新增：处理培养皿（内含清水）拖拽 ==========
        if (name === '培养皿（内含清水）') {
            // 显示培养皿图片（dish-with-water.png）
            const dipDish = document.getElementById('dip-water-dish');
            dipDish.classList.remove('hidden');
            // 标记已拖拽培养皿
            state.hasDish = true;
            addLog("✅ 已放置培养皿（内含清水），可进行切割操作");
            // 不改变当前步骤，仅显示图片
            return;
        }
          if (tools.includes(name)) {
            // 隐藏所有图层
                 if (state.lastAction !== "dip") {
            state.totalDeduction += 0.5;
            state.details.push(`未蘸水就放置${name}`);
            addLog(`❌ 请先完成前面操作，再放置${name}！`);
            //showQuizModal(1);
            return;
        }
            document.getElementById('cutting-zone').classList.add('hidden');
            //document.getElementById('dish-zone').classList.add('hidden');
            document.getElementById('temp-slide-zone').classList.add('hidden');
            document.getElementById('micro-view').classList.add('hidden');
            //document.getElementById('brush-tool').classList.add('hidden');

            // 只显示培养皿
            const dipDish = document.getElementById('dip-water-dish');
            dipDish.classList.remove('hidden');

            // 清空旧工具
            //clearAllToolElements();

            // 显示对应工具
            showTool(name);
            addLog(`✅ 已放置：${name}`);
            return;
        }
        // 步骤1：放置小木板
        if (name === '小木板' && state.step === 0) {
            document.getElementById('cutting-zone').classList.remove('hidden');
            document.getElementById('s-cut-step').innerText = "已放木板 → 请放叶片";
            state.step = 1;
            //guide.innerText = "请将「新鲜菠菜叶片」平放在木板上";
            addLog("✅ 放置小木板");
        } 
        // 步骤2：放置菠菜叶片
        else if (name === '新鲜菠菜叶片' && state.step === 1) {
            leafItem.classList.remove('hidden');
            document.getElementById('s-cut-step').innerText = "已放叶片 → 请放双面刀片";
            state.step = 2;
            //guide.innerText = "如果没有选择培养皿（含清水），选择完成后再拖入-双面刀片";
            addLog("✅ 放置菠菜叶片");
        }
         // 步骤3：放置刀片（仅需1个）
        else if (name === '双面刀片' && state.step === 2) {
            state.bladeCount++;
            // 仅需1个刀片，直接显示并解锁切割按钮
            if (state.bladeCount === 1) {
                blade1.classList.remove('hidden');
                cutButtons.classList.remove('hidden'); 
                document.getElementById('s-cut-step').innerText = "双面刀片 → 切割前必须先蘸水！"; // 修改提示
                state.step = 3;
                //guide.innerText = "切割前必须先点击「蘸水」按钮，再点击切割！"; // 修改提示
                addLog("✅ 放置双面刀片，切割前请先点击「蘸水」按钮");
            }
        }
        // 步骤4：放置清水（切割完成后）
      else if (name === '清水' && state.step === 3 && state.hasCut) {
            // 隐藏双面刀片和切割按钮
            blade1.classList.add('hidden');
            if (blade2) blade2.classList.add('hidden');
            cutButtons.classList.add('hidden');
            // 强制显示培养皿区（修复：确保显示）
            const dishZone = document.getElementById('dish-zone');
            dishZone.classList.remove('hidden');
            // 额外：隐藏蘸水专用培养皿（避免重叠）
            //document.getElementById('dip-water-dish').classList.add('hidden');
            
            state.step = 4;
            document.getElementById('s-cut-step').innerText = "已放清水 → 请放毛笔选取切片";
           // guide.innerText = "请拖入「毛笔」选取培养皿中最薄的切片";
            addLog("✅ 放置清水（双面刀片已蘸水，切割完成）");
        }
        // 步骤5：放置毛笔（修改：隐藏临时切片，不隐藏毛笔）
    else if (name === '毛笔' && state.step === 4) {
        playBrushAnimation();
        // 隐藏切片区和培养皿区（原有）
        document.getElementById('cutting-zone').classList.add('hidden');
        document.getElementById('dish-zone').classList.add('hidden');
        // 关键修改：强制隐藏临时切片（不再自动显示）
        document.getElementById('temp-slide-zone').classList.add('hidden');
        state.step = 5;
        document.getElementById('s-cut-step').innerText = "已蘸取切片 → 请放载玻片制作临时切片";
        //guide.innerText = "请拖入「载玻片」制作临时切片（放置后毛笔会隐藏）";
        addLog("✅ 用毛笔选取最薄切片，等待放置载玻片");
    }
    // 新增步骤6：放置载玻片（显示临时切片 + 隐藏毛笔）
    else if (name === '载玻片' && state.step === 5) {
        // 显示临时切片
        document.getElementById('temp-slide-zone').classList.remove('hidden');
        // 隐藏毛笔
        //document.getElementById('brush-tool').classList.add('hidden');
        state.step = 6;
        document.getElementById('s-cut-step').innerText = "已制作临时切片 → 请放显微镜";
        //guide.innerText = "请拖入「显微镜」开始观察叶片组织";
        addLog("✅ 放置载玻片，完成临时切片制作");
    }
    // 步骤7：放置显微镜
    else if (name === '显微镜' && (state.step === 6 || state.step === 7)) {
        // 清空所有工具（载玻片、盖玻片、培养皿等）
        // clearAllTools();
        document.getElementById('dip-water-dish').classList.add('hidden')
        // 隐藏临时切片区，显示显微镜区
        document.getElementById('temp-slide-zone').classList.add('hidden');
        document.getElementById('micro-view').classList.remove('hidden');
        // 新增：显示显微镜目镜视野
        document.getElementById('eyepiece-circle').classList.remove('hidden');
        initMicroscope();
        state.step = 7;
        document.getElementById('s-cut-step').innerText = "显微镜已放置 → 按步骤操作：粗准焦上升→转换器→反光镜→载玻片→粗准焦下降→细准焦";
    //guide.innerText = "请按显微镜左侧按钮顺序操作（从上到下），完成调焦观察";
    addLog("✅ 放置显微镜并完成对光，开始按步骤操作显微镜按钮");

    }
        // 无效操作提示（修改：仅当不是以上合法操作时提示）
        else if(!tools.includes(name) && name !== '培养皿（内含清水）' && name !== '小木板' && name !== '新鲜菠菜叶片' && name !== '双面刀片' && name !== '显微镜') {
            addLog(`⚠️ 当前步骤无法放置「${name}」，请按指引操作`);
        }
    }

function clearAllTools() {
    // 隐藏载玻片、盖玻片、培养皿、纱布、清水、毛笔、镊子
    const toolsToClear = [
        'tool-slide', 'tool-coverslide', 'dip-water-dish',
        'tool-gauze', 'tool-water', 'brush-tool', 'tool-forceps'
    ];
    toolsToClear.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    addLog("🧹 已清空载玻片、盖玻片、培养皿等工具，准备放置显微镜");
}
  //3. 切割逻辑（核心修改：所有切割都必须蘸水，第一次也不例外）
    btnDipWater.onclick = () => {
        if (state.step !== 3) {
            state.totalDeduction += 0.5;
            state.details.push("制作切片：未放置双面刀片就点击蘸水 (-0.5)");
            addLog("❌ 请先放置双面刀片！→ 扣0.5分");
            showOperationVideoModal('qiege.mp4', '叶片切割操作教学', 2);
            //showQuizModal(1)
            return;
        }
        
        // 1. 显示蘸水培养皿（图片）
        const dipDish = document.getElementById('dip-water-dish');
        dipDish.classList.remove('hidden');
         //  initTools();
        // 2. 获取刀片元素并添加蘸水动画
        const blade = document.querySelector('.blade.b1');
        blade.classList.add('blade-dipping');
        
        // 3. 动画结束后移除动画类，标记蘸水完成
        setTimeout(() => {
            blade.classList.remove('blade-dipping');
            state.isDipped = true;
            // 👇 解锁后续器材拖拽
            state.canDragToolsAfterDip = true; // 解锁拖拽
            state.lastAction = "dip"; // 记录最后一次操作是蘸水
            addLog("✅ 双面刀片已蘸水（可进行切割操作）");
            //guide.innerText = "双面刀片已蘸水 → 可点击「切割」按钮进行切割";
        }, 1200); // 动画时长和CSS中一致（1.2秒）
    };

 btnCut.onclick = () => {
        // 未放置刀片的场景
        if (state.step !== 3) {
            state.totalDeduction += 0.5;
            state.details.push("制作切片：未放置刀片就点击切割 (-0.5)");
            addLog("❌ 请先放置刀片！→ 扣0.5分");
            showOperationVideoModal('qiege.mp4', '叶片切割操作教学', 2);
            return;
        }
      // ========== 新增：校验2：未拖拽培养皿（内含清水） ==========
        if (!state.hasDish) {
            //state.totalDeduction += 0.5;
            state.details.push("制作切片：未放置培养皿（内含清水）就点击切割");
            addLog("❌ 请先拖拽「培养皿（内含清水）」到操作台！");
            //showQuizModal(3);
            return;
        }

        // ========== 核心修改：所有切割都必须先蘸水（包括第一次） ==========
        if (!state.isDipped) {
            state.totalDeduction += 0.5;
            state.details.push("制作切片：切割前未蘸水（首次切割也需蘸水） (-0.5)");
            addLog("❌ 切割前必须先蘸水！→ 扣0.5分，请先点击「蘸水」按钮");
            showOperationVideoModal('qiege.mp4', '叶片切割操作教学', 2);
            return;
        }

        // 切割次数+1
        state.cutCount++;
        // 标记已完成切割（关键：用于后续拖入清水的校验）
        state.hasCut = true;
        state.canDragToolsAfterDip = false; // 切割后锁定拖拽
        state.lastAction = "cut"; // 记录最后一次操作是切割

        // 所有切割（首次/后续）都执行统一逻辑
        startCuttingAnimation();
        state.isDipped = false; // 切割后重置蘸水状态
     // 3. 新的切割逻辑（替换原有动画，显示自定义图片）
    // 隐藏原椭圆叶片
    document.getElementById('leaf-on-wood').classList.add('hidden');
    // 显示切割后的图片
    const cutLeafImg = document.getElementById('cut-leaf-img');
    if (cutLeafImg) cutLeafImg.classList.remove('hidden');
    // 日志提示（复用原有addLog函数，保持日志格式统一）
    addLog(`✅ 第${state.cutCount}次切割成功（已蘸水），叶片已替换为切割后图片`);
    //guide.innerText = `第${state.cutCount}次切割完成 → 如需再次切割请重新「蘸水」-然后请独立完成后续制作切片操作`;
    };

    // 双面刀片切割动画（含叶片切割效果）
    function startCuttingAnimation() {
        const bladesGroup = document.getElementById('blades-group');
        bladesGroup.classList.add('is-cutting');
        // 叶片添加切割样式（切成碎片效果）
        leafItem.classList.add('leaf-cut');
        // 2秒后停止切割动画
        setTimeout(() => {
            bladesGroup.classList.remove('is-cutting');
        }, 2000);
    }

    // 毛笔选取切片动画
    function playBrushAnimation() {
        const brush = document.getElementById('brush-tool');
        brush.classList.remove('hidden');
        addLog("✅ 用毛笔蘸取培养皿中最薄的切片");
        // // 1.5秒后隐藏毛笔
        // setTimeout(() => {
        //     brush.classList.add('hidden');
        // }, 1500);
    }
   // ========== 新增：纱布擦拭动画核心函数 ==========
    function startGauzeWipeAnimation() {
        const gauze = document.getElementById('tool-gauze');
        const coverSlidePos = toolPositions['盖玻片'];
        const slidePos = toolPositions['载玻片'];
        
        // 新增：添加旋转动画类
    gauze.classList.add('gauze-wiping');
    
    // 1. 第一步：移动到盖玻片位置
    animateToolMove(gauze, coverSlidePos.x, coverSlidePos.y, 1000, () => {
        addLog("🧽 纱布擦拭盖玻片");
        
        // 2. 第二步：移动到载玻片位置
        animateToolMove(gauze, slidePos.x, slidePos.y, 1000, () => {
            addLog("🧽 纱布擦拭载玻片");
            
            // 移除旋转动画类
            gauze.classList.remove('gauze-wiping');
            
            // 3. 隐藏纱布
            setTimeout(() => {
                gauze.classList.add('hidden');
                addLog("✅ 纱布擦拭完成，已收起");
            }, 300);
        });
    });
    }
 // ========== 新增：清水滴落动画核心函数 ==========
function startWaterDropAnimation() {
    const water = document.getElementById('tool-water');
    const slidePos = toolPositions['载玻片']; // 载玻片目标位置
    
    // 新增：添加滴水动画类（模拟下落效果）
    water.classList.add('water-dropping');
    
    // 动画移动：从清水初始位置 → 载玻片位置（时长1.2秒，和刀片蘸水动画时长一致）
    animateToolMove(water, slidePos.x, slidePos.y, 1200, () => {
        // 动画结束：移除滴水类，保留在载玻片位置（重叠显示）
        water.classList.remove('water-dropping');
        addLog("💧 清水滴加到载玻片上"); // 日志记录
    });
}
// ========== 新增：毛笔蘸取动画核心函数 ==========
function startBrushDipAnimation() {
    const brush = document.getElementById('brush-tool');
    const dish = document.getElementById('dip-water-dish'); // 培养皿元素
    const waterTool = document.getElementById('tool-water'); // 清水工具元素
    
    // 1. 获取培养皿和清水的坐标（基于DOM实际位置，确保精准）
    const dishRect = dish.getBoundingClientRect();
    const stageRect = document.getElementById('mainStage').getBoundingClientRect();
    const waterRect = waterTool.getBoundingClientRect();
    
    // 计算培养皿在舞台内的相对坐标（中心位置，确保毛笔对准培养皿）
    const dishCenterX = dishRect.left - stageRect.left + dishRect.width / 2 - brush.offsetWidth / 2 + 30;
    const dishCenterY = dishRect.top - stageRect.top + dishRect.height / 2 - brush.offsetHeight / 2;
    
    // 计算清水工具的中心坐标
    const waterCenterX = waterRect.left - stageRect.left + waterRect.width / 2 - brush.offsetWidth / 2 - 10 ;
    const waterCenterY = waterRect.top - stageRect.top + waterRect.height / 2 - brush.offsetHeight / 2 + 35 ;

    // 第一步：移动到培养皿位置（动画时长1.2秒，和刀片蘸水一致）
    animateToolMove(brush, dishCenterX, dishCenterY, 1200, () => {
        // 培养皿位置抖动（模拟蘸取切片）
        brush.classList.add('brush-dipping');
        addLog("🖌️ 用毛笔蘸取培养皿中最薄的切片"); // 日志记录
        
        // 抖动1秒后停止，继续下一步
        setTimeout(() => {
            brush.classList.remove('brush-dipping');
            
            // 第二步：移动到清水位置（动画时长1秒）
            animateToolMove(brush, waterCenterX, waterCenterY, 1000, () => {
                // 清水位置抖动（模拟蘸水）
                brush.classList.add('brush-dipping');
                addLog("🖌️ 毛笔蘸取清水"); // 日志记录
                
                // 抖动1秒后停止
                setTimeout(() => {
                    brush.classList.remove('brush-dipping');
                }, 1000);
            });
        }, 1000);
    });
}
// ========== 新增：镊子夹取盖玻片动画核心函数 ==========
function startTweezersAnimation() {
    const forceps = document.getElementById('tool-forceps');
    const coverSlide = document.getElementById('tool-coverslide');
    const slide = document.getElementById('tool-slide');
    const water = document.getElementById('tool-water');
    const brush = document.getElementById('brush-tool');

    if (!forceps || !coverSlide || !slide || !water || !brush) {
        addLog("⚠️ 工具未加载完成，请稍后再试！");
        return;
    }

    // 获取坐标
    const coverSlideRect = coverSlide.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();
    const stageRect = document.getElementById('mainStage').getBoundingClientRect();

    // 镊子初始位置（盖玻片位置）
    const forcepsStartX = coverSlideRect.left - stageRect.left;
    const forcepsStartY = coverSlideRect.top - stageRect.top;
    
    // 镊子最终位置（载玻片位置）
    const forcepsEndX = slideRect.left - stageRect.left;
    const forcepsEndY = slideRect.top - stageRect.top;

    // 第一步：镊子移动到盖玻片位置
    animateToolMove(forceps, forcepsStartX, forcepsStartY, 1000, () => {
        addLog("🖐️ 镊子夹取盖玻片");
        
        // 停留0.5秒
        setTimeout(() => {
            // 第二步：同时移动镊子和盖玻片到载玻片位置
            animateToolMove(forceps, forcepsEndX, forcepsEndY, 1000);
            animateToolMove(coverSlide, forcepsEndX, forcepsEndY, 1000, () => {
                addLog("📌 镊子夹取盖玻片到载玻片上，形成切片");
                
                // 确保盖玻片在正确位置
                coverSlide.style.zIndex = '1000';
                
                // 隐藏镊子和其他工具
                forceps.classList.add('hidden');
                water.classList.add('hidden');
                brush.classList.add('hidden');
            });
        }, 500);
        state.step = 6;
//guide.innerText = "镊子操作完成 → 请拖入「显微镜」开始观察";
document.getElementById('s-cut-step').innerText = "已完成切片制作 → 请放显微镜";
    });
}
// 通用错误处理函数：先弹视频，再弹题
function handleErrorWithVideo(videoSrc, videoTitle, category) {
    // 如果该类题目已经弹过，直接返回（避免重复）
    // if (state.hasShownQuiz[category]) {
    //     return;
    // }
    
    // 先弹视频
    showOperationVideoModal(videoSrc, videoTitle, category);
}
    // ========== 新增：通用工具移动动画函数（复用性强） ==========
    function animateToolMove(element, targetX, targetY, duration, callback) {
        // 获取元素当前位置（从CSS的left/top解析）
        const startX = parseFloat(element.style.left.replace('px', '')) || toolPositions['纱布'].x;
        const startY = parseFloat(element.style.top.replace('px', '')) || toolPositions['纱布'].y;
        const startTime = performance.now();

        // 逐帧动画（和刀片蘸水动画原理一致）
        function moveStep(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1); // 进度0~1
            
            // 线性插值计算当前位置（保证动画平滑）
            const currentX = startX + (targetX - startX) * progress;
            const currentY = startY + (targetY - startY) * progress;
            
            // 更新元素位置
            element.style.left = `${currentX}px`;
            element.style.top = `${currentY}px`;

            if (progress < 1) {
                requestAnimationFrame(moveStep); // 继续下一帧
            } else {
                callback && callback(); // 动画完成执行回调
            }
        }

        requestAnimationFrame(moveStep);
    }
function initToolClickListeners() {
    // 1. 核心配置：工具顺序 + 操作完成状态（新增）
    const toolOrder = [
        { id: 'tool-gauze', name: '纱布', action: '擦拭', completed: false },
        { id: 'tool-water', name: '清水', action: '滴加', completed: false },
        { id: 'brush-tool', name: '毛笔', action: '蘸取切片', completed: false },
        { id: 'tool-forceps', name: '镊子', action: '夹取盖玻片', completed: false }
    ];
    state.toolStep = 0; // 操作步骤（0-未开始，1-纱布完成，2-清水完成，3-毛笔完成，4-镊子完成）

    // 2. 重构工具校验逻辑：区分“未拖拽”和“已完成操作”
    const requiredTools = [
        { id: 'tool-slide', name: '载玻片' },
        { id: 'tool-forceps', name: '镊子' },
        { id: 'tool-gauze', name: '纱布' },
        { id: 'tool-coverslide', name: '盖玻片' },
        { id: 'brush-tool', name: '毛笔' },
        { id: 'tool-water', name: '清水' }
    ];

    function checkAllToolsValid() {
        const invalidTools = [];
        requiredTools.forEach(tool => {
            const element = document.getElementById(tool.id);
            // 跳过已完成操作的工具（即使隐藏也视为有效）
            const isCompletedTool = toolOrder.some(item => item.id === tool.id && item.completed);
            if (isCompletedTool) return;

            // 未完成操作的工具：必须显示（未隐藏）才视为有效
            if (!element || element.classList.contains('hidden')) {
                invalidTools.push(tool.name);
            }
        });

        if (invalidTools.length > 0) {
            handleErrorWithVideo('caozuo.mp4', '实验操作教学', 2);
            return `❌ 请先将「${invalidTools.join('、')}」拖拽到操作台后，再进行操作！`;
        }
        return null;
    }

    // 3. 顺序校验函数：适配完成状态
    function checkToolOrder(currentToolId) {
        const currentIndex = toolOrder.findIndex(item => item.id === currentToolId);
        if (currentIndex === -1) {
             handleErrorWithVideo('caozuo.mp4', '实验操作教学', 2);
            return `❌ 无效操作：该工具无需按顺序操作！`;
        }
        // 已完成的工具重复点击
        if (toolOrder[currentIndex].completed) {
            const nextTool = toolOrder.find((item, idx) => idx === state.toolStep);+
            handleErrorWithVideo('caozuo.mp4', '实验操作教学', 2);
            return `❌ 「${toolOrder[currentIndex].name}」已操作完成，请勿重复点击！${nextTool ? `请继续点击「${nextTool.name}」完成${nextTool.action}。` : ''}`;
        }
        // 顺序错误（未到当前工具步骤）
        if (currentIndex > state.toolStep) {
            const nextTool = toolOrder[state.toolStep];
             handleErrorWithVideo('caozuo.mp4', '实验操作教学', 2);
            return `❌ 操作顺序错误：请先点击「${nextTool.name}」完成${nextTool.action}后，再操作当前工具！`;
        }
        return null;
    }

    // 4. 标记工具操作完成的函数（新增）
    function markToolCompleted(toolId) {
        const toolItem = toolOrder.find(item => item.id === toolId);
        if (toolItem) {
            toolItem.completed = true;
        }
    }

    // 5. DOM元素获取
    const gauze = document.getElementById('tool-gauze');
    const water = document.getElementById('tool-water');
    const brush = document.getElementById('brush-tool');
    const dish = document.getElementById('dip-water-dish'); 
    const waterTool = document.getElementById('tool-water'); 
    const forceps = document.getElementById('tool-forceps'); 

    // 6. 纱布点击监听（修复隐藏后校验错误）
    gauze.style.pointerEvents = 'auto';
    gauze.addEventListener('click', () => {
        const checkMsg = checkAllToolsValid(); // 改用新的校验函数
        if (checkMsg) {
            addLog(checkMsg);
            return;
        }
        const orderMsg = checkToolOrder('tool-gauze');
        if (orderMsg) {
            addLog(orderMsg);
            return;
        }
        // 执行动画 + 标记完成 + 更新步骤
        startGauzeWipeAnimation();
        markToolCompleted('tool-gauze'); // 标记纱布已完成（即使隐藏也视为有效）
        state.toolStep++;
        addLog(`✅ 已完成「纱布」擦拭（纱布自动收起），下一步请点击「清水」进行滴加！`);
    });

    // 7. 清水点击监听（修复纱布隐藏后的校验）
    water.style.pointerEvents = 'auto';
    water.addEventListener('click', () => {
        const checkMsg = checkAllToolsValid(); // 改用新的校验函数
        if (checkMsg) {
            addLog(checkMsg);
            return;
        }
        const orderMsg = checkToolOrder('tool-water');
        if (orderMsg) {
            addLog(orderMsg);
            return;
        }
        // 执行动画 + 标记完成 + 更新步骤
        startWaterDropAnimation();
        markToolCompleted('tool-water'); // 标记清水已完成
        state.toolStep++;
        addLog(`✅ 已完成「清水」滴加，下一步请点击「毛笔」蘸取切片！`);
    });

    // 8. 毛笔点击监听（修复纱布/清水隐藏后的校验）
    if (brush) {
        brush.style.pointerEvents = 'auto';
        brush.style.cursor = 'pointer';
        brush.addEventListener('click', () => {
            const checkMsg = checkAllToolsValid(); // 改用新的校验函数
            if (checkMsg) {
                addLog(checkMsg);
                return;
            }
            const orderMsg = checkToolOrder('brush-tool');
            if (orderMsg) {
                addLog(orderMsg);
                return;
            }
            // 原有专属校验
            if (!dish || dish.classList.contains('hidden')) {
                addLog("❌ 请先放置培养皿（内含清水），再使用毛笔！");
                showQuizModal(4);
                return;
            }
            if (!waterTool || waterTool.classList.contains('hidden') && !toolOrder.find(item => item.id === 'tool-water').completed) {
                addLog("❌ 请先放置清水工具，再使用毛笔！");
                showQuizModal(4);
                return;
            }
            // 执行动画 + 标记完成 + 更新步骤
            startBrushDipAnimation();
            markToolCompleted('brush-tool'); // 标记毛笔已完成
            state.toolStep++;
            addLog(`✅ 已完成「毛笔」蘸取切片，下一步请点击「镊子」夹取盖玻片！`);
        });
    }

    // 9. 镊子点击监听（修复前置工具隐藏后的校验）
    if (forceps) {
        forceps.style.pointerEvents = 'auto';
        forceps.style.cursor = 'pointer';
        forceps.addEventListener('click', () => {
 
            const checkMsg = checkAllToolsValid(); // 改用新的校验函数
            if (checkMsg) {
                addLog(checkMsg);
                return;
            }
            const orderMsg = checkToolOrder('tool-forceps');
            if (orderMsg) {
                addLog(orderMsg);
                return;
            }
            // 原有专属校验
            const coverSlide = document.getElementById('tool-coverslide');
            const slide = document.getElementById('tool-slide');
            if (!coverSlide || coverSlide.classList.contains('hidden')) {
                addLog("❌ 请先放置盖玻片，再使用镊子！");
               showOperationVideoModal('gaigaibopian.mp4', '盖盖玻片操作教学', 5);
                return;
            }
            if (!slide || slide.classList.contains('hidden')) {
                addLog("❌ 请先放置载玻片，再使用镊子！");
              showOperationVideoModal('gaigaibopian.mp4', '盖盖玻片操作教学', 5);
                return;
            }
            // 执行动画 + 标记完成 + 更新步骤
            startTweezersAnimation();
            markToolCompleted('tool-forceps'); // 标记镊子已完成
            state.toolStep++;
            addLog(`🎉 已完成所有工具操作：纱布→清水→毛笔→镊子，顺序正确！`);
        });
    }
}
 // 显微镜核心逻辑：按钮事件+步骤控制
function initMicroscopeControls() {
    const btnCoarseFocus = document.getElementById('btnCoarseFocus');
    const btnFineFocus = document.getElementById('btnFineFocus');
    const btnRevolver = document.getElementById('btnRevolver');
    const btnMirror = document.getElementById('btnMirror');
    const btnSlidePlace = document.getElementById('btnSlidePlace');
    const microImage = document.getElementById('micro-image');

    // 初始禁用细准焦按钮
    btnFineFocus.disabled = state.isFineBtnDisabled;

    // 1. 粗准焦螺旋按钮（点击2次：上升→下降）
    btnCoarseFocus.onclick = () => {
        if (state.microStep === 0) {
            // 第一次点击：镜筒上升，步骤变为1，禁用按钮
            addLog("🔬 旋转粗准焦螺旋，使镜筒上升");
            state.microStep = 1;
            state.coarseFocusClickCount = 1;
            state.isCoarseBtnDisabled = true;
            btnCoarseFocus.disabled = true;
            btnCoarseFocus.style.opacity = 0.1; // 禁用后更透明
        } else if (state.microStep === 4 && state.coarseFocusClickCount === 1) {
            // 第二次点击：镜筒下降（对应原btnFocusUp逻辑），步骤变为5
            addLog("🔬 旋转粗准焦螺旋，镜筒下降（眼睛注视物镜，避免压碎玻片）");
            state.focusLevel--;
            state.coarseFocusClickCount = 2;
            // 计算模糊值（复用原有逻辑）
            state.microStep = 4.5;
            const blurVal = Math.abs(5 - state.focusLevel) * 3;
            microImage.style.filter = `blur(${blurVal}px)`;
            // 禁用粗准焦，启用细准焦
            state.isCoarseBtnDisabled = false;
            btnCoarseFocus.disabled = false;
            btnFineFocus.style.opacity = 0.3;
        } else if (state.microStep === 4.5 && state.coarseFocusClickCount === 2) {
        // 第三次点击：调整粗准焦找物象，禁用按钮，启用细准焦
        addLog("🔬 旋转粗准焦螺旋，调整焦距寻找物像");
        state.focusLevel--;
        state.microStep = 5;
        state.coarseFocusClickCount = 3;
        // 计算模糊值
        const blurVal = Math.abs(5 - state.focusLevel) * 3;
        microImage.style.filter = `blur(${blurVal}px)`;
        // 禁用粗准焦，启用细准焦
        state.isCoarseBtnDisabled = true;
        btnCoarseFocus.disabled = true;
        btnCoarseFocus.style.opacity = 0.1;
        state.isFineBtnDisabled = false;
        btnFineFocus.disabled = false;
        btnFineFocus.style.opacity = 0.3;
    } else {
            addLog("⚠️ 请按步骤操作：先完成转换器→反光镜→载玻片放置");
        }
    };

    // 2. 细准焦螺旋按钮（对应原btnFocusDown逻辑）
    btnFineFocus.onclick = () => {
        if (state.microStep === 5) {
            addLog("🔬 调整细准焦螺旋，寻找清晰物像");
            state.focusLevel++;
            // 计算模糊值（复用原有逻辑）
            const blurVal = Math.abs(5 - state.focusLevel) * 3;
            microImage.style.filter = `blur(${blurVal}px)`;
            
            if (blurVal === 0) {
                addLog("✨ 物像已清晰！可提交实验报告");
                state.microStep = 6;
                btnFineFocus.disabled = true;
                btnFineFocus.style.opacity = 0.1;
            } else if (Math.abs(state.focusLevel) > 8 && !state.hasFocusDeducted) {
                state.totalDeduction += 0.5;
                state.details.push("显微镜观察：调焦过度 (-0.5)");
                state.hasFocusDeducted = true;
                addLog("⚠️ 调焦过度 → 扣0.5分");
                //showQuizModal(3);
            }
        } else {
            addLog("⚠️ 请先完成粗准焦螺旋下降步骤");
        }
    };

    // 3. 转换器按钮
    btnRevolver.onclick = () => {
        if (state.microStep === 1) {
            addLog("🔬 转动转换器，低倍物镜对准通光孔");
            state.microStep = 2;
            state.isRevolverBtnDisabled = true;
            btnRevolver.disabled = true;
            btnRevolver.style.opacity = 0.1;
        } else {
            addLog("⚠️ 请先旋转粗准焦螺旋使镜筒上升");
        }
    };

    // 4. 反光镜按钮
    btnMirror.onclick = () => {
        if (state.microStep === 2) {
            addLog("🔬 调整反光镜，看到白亮圆形视野");
            state.microStep = 3;
            state.isMirrorBtnDisabled = true;
            btnMirror.disabled = true;
            btnMirror.style.opacity = 0.1;
        } else {
            addLog("⚠️ 请先转动转换器对准低倍物镜");
        }
    };

    // 5. 载玻片放置按钮
    btnSlidePlace.onclick = () => {
        if (state.microStep === 3) {
            addLog("🔬 载玻片放置在载物台");
            state.microStep = 4;
            state.isSlidePlaceBtnDisabled = true;
            btnSlidePlace.disabled = true;
            btnSlidePlace.style.opacity = 0.1;
            document.getElementById('tool-slide').classList.add('hidden')
            document.getElementById('tool-coverslide').classList.add('hidden')
            // 启用粗准焦按钮（允许第二次点击）
            state.isCoarseBtnDisabled = false;
            btnCoarseFocus.disabled = false;
            btnCoarseFocus.style.opacity = 0.3;
        } else {
            addLog("⚠️ 请先调整反光镜看到白亮视野");
        }
    };
}

// 初始化显微镜控制（在放置显微镜后调用）
function initMicroscope() {
    // 显示显微镜区，隐藏临时切片（保留载玻片和盖玻片）
    document.getElementById('temp-slide-zone').classList.add('hidden');
    document.getElementById('micro-view').classList.remove('hidden');
    document.getElementById('eyepiece-circle').classList.remove('hidden');
    
    // 初始化按钮状态
    state.microStep = 0;
    state.coarseFocusClickCount = 0;
    state.isCoarseBtnDisabled = false;
    state.isFineBtnDisabled = true;
    state.isRevolverBtnDisabled = false;
    state.isMirrorBtnDisabled = false;
    state.isSlidePlaceBtnDisabled = false;
    
    // 初始化按钮样式
    const btnCoarseFocus = document.getElementById('btnCoarseFocus');
    const btnFineFocus = document.getElementById('btnFineFocus');
    const btnRevolver = document.getElementById('btnRevolver');
    const btnMirror = document.getElementById('btnMirror');
    const btnSlidePlace = document.getElementById('btnSlidePlace');
    
    btnCoarseFocus.disabled = false;
    btnCoarseFocus.style.opacity = 0.3;
    btnFineFocus.disabled = true;
    btnFineFocus.style.opacity = 0.1;
    btnRevolver.disabled = false;
    btnRevolver.style.opacity = 0.3;
    btnMirror.disabled = false;
    btnMirror.style.opacity = 0.3;
    btnSlidePlace.disabled = false;
    btnSlidePlace.style.opacity = 0.3;
    
    // 调用控制逻辑初始化
    initMicroscopeControls();
}
    // 5. 器材清点逻辑：修改扣分方式
document.getElementById('prepareBtn').onclick = () => {
    const modal = document.getElementById('equip-modal');
    const grid = document.getElementById('equipGrid');
    modal.style.display = 'flex';
    grid.innerHTML = '';
    
    // 关键修改：先打乱所有器材的顺序，再生成选项
    const shuffledEquips = shuffleArray(allEquipsForCheck);
    shuffledEquips.forEach(name => {
        const item = document.createElement('label');
        item.className = 'equip-item';
        item.innerHTML = `<input type="checkbox" value="${name}"> ${name}`;
        grid.appendChild(item);
    });
};
    document.getElementById('submitEquip').onclick = () => {
        const checkedItems = Array.from(document.querySelectorAll('#equipGrid input:checked')).map(i => i.value);
        const selectedDistract = checkedItems.filter(v => distractEquips.includes(v));
        const missingRequired = requiredEquips.filter(v => !checkedItems.includes(v));
        
        let logMsg = "";
        if (selectedDistract.length > 0 && missingRequired.length > 0) {
              handleErrorWithVideo('qingdian.mp4', '器材清点教学', 1); // 先弹视频
            logMsg = `❌ 器材清点错误：多选了${selectedDistract.join('、')}，漏选了${missingRequired.join('、')} → 扣0.5分`;
            state.totalDeduction += 0.5;
            state.details.push(`清点器材：多选${selectedDistract.length}个干扰项/漏选${missingRequired.length}个必需项 (-0.5)`);
             //showQuizModal(1);
        } else if (selectedDistract.length > 0) {
            handleErrorWithVideo('qingdian.mp4', '器材清点教学', 1); // 先弹视频 
            logMsg = `❌ 器材清点错误：多选了干扰项${selectedDistract.join('、')} → 扣0.5分`;
            state.totalDeduction += 0.5;
            state.details.push(`清点器材：多选${selectedDistract.length}个干扰项 (-0.5)`);
            handleErrorWithVideo('qingdian.mp4', '器材清点教学', 1); // 先弹视频
        } else if (missingRequired.length > 0) {
            showCheckVideoModal(); 
            logMsg = `❌ 器材清点错误：漏选了必需器材${missingRequired.join('、')} → 扣0.5分`;
            state.totalDeduction += 0.5;
            state.details.push(`清点器材：漏选${missingRequired.length}个必需项 (-0.5)`);
              handleErrorWithVideo('qingdian.mp4', '器材清点教学', 1); // 先弹视频
        } else {
            logMsg = "✅ 器材清点正确！已解锁实验操作";
        }

        if (selectedDistract.length > 0 || missingRequired.length > 0) {
            state.prepared = false;
            document.getElementById('s-prepare').innerText = "❌ 清点错误，请重新清点";
        } else {
            state.prepared = true;
            document.getElementById('s-prepare').innerText = "✅ 清点正确（可开始拖拽操作）";
            initShelf(); 
            shelf.style.display = 'flex';
            //guide.innerText = "请将「小木板」拖入实验区开始实验";
        }

        addLog(logMsg);
        document.getElementById('equip-modal').style.display = 'none';
    };

    // 6. 实验报告提交：修改扣分方式
  document.getElementById('recordBtn').onclick = () => {
    const val = document.getElementById('reportInput').value.trim();
    const keywords = ['保护组织', '薄壁组织', '输导组织', '机械组织','制作叶片横切面临时切片','观察叶片横切面临时切片'];
    const pass = keywords.every(k => val.includes(k));
    
    if (pass) {
        addLog("✅ 实验报告正确（包含所有组织类型）");
    } else {
        // 核心修改：累加扣分数 + 记录详情 + 触发答题弹窗
        state.totalDeduction += 0.5;
        state.details.push("实验报告：缺少组织类型描述 (-0.5)");
        addLog("❌ 实验报告不完整 → 扣0.5分");
        //showQuizModal(5); // 新增：触发答题弹窗
    }
    document.getElementById('reportInput').disabled = true;
};

    // 7. 整理还原 & 评分计算：核心修改（5分 - 总扣分数）
    document.getElementById('tidyBtn').onclick = () => {
        // 最终总分 = 满分5分 - 总扣分数（确保最低分为0）
        const total = Math.max(0, 5 - state.totalDeduction);
        document.getElementById('finalScore').innerText = total.toFixed(1) + " 分";
        document.getElementById('scoreDetails').innerHTML = state.details.length > 0 ? 
            "扣分详情：<br>" + state.details.join('<br>') : "🎉 表现完美，满分！";
        document.getElementById('report-modal').style.display = 'flex';
    };

    // 8. 辅助功能：日志添加
    function addLog(msg) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        // 格式化时间：分:秒
        const time = new Date().toLocaleTimeString().slice(3, 8);
        entry.innerText = `[${time}] ${msg}`;
        logPanel.prepend(entry);
    }

// 按分类获取随机题目（n为抽取数量）
function getRandomQuestions(category, n = RANDOM_QUESTION_COUNT) { 
  // 验证分类是否存在
  if (!questionBank[category]) {
    console.warn(`分类${category}不存在，默认使用分类1`);
    category = 1;
  }
  // 深拷贝对应分类的题目数组，避免修改原数组
  const categoryQuestions = JSON.parse(JSON.stringify(questionBank[category]));
  // 打乱数组并抽取n道题
  const shuffled = categoryQuestions.sort(() => 0.5 - Math.random());
  // 抽取n道题（最多不超过该分类的题目总数）
  return shuffled.slice(0, Math.min(n, categoryQuestions.length));
}
// 显示答题弹窗（按分类出题）
function showQuizModal(category = 1) { // 默认分类1
    // 注意：这里不再检查 hasShownQuiz，因为在视频弹窗中已经检查并标记了
    // 如果直接调用 showQuizModal（比如预习模式），需要确保 hasShownQuiz 正确设置
    
    // 强制重置所有答题状态
    state.currentQuestions = [];
    state.answeredCount = 0;
    state.isAnswering = true;
  window.currentQuizCategory = category;
    // 调用批量出题函数（按指定分类抽题）
    state.currentQuestions = getRandomQuestions(category, RANDOM_QUESTION_COUNT);

    const modal = document.getElementById('quiz-modal');
    const content = document.getElementById('quiz-content');
    const remainEl = document.getElementById('quiz-remain');
    if (remainEl) {
        remainEl.innerText = state.currentQuestions.length - state.answeredCount;
    }

    // 渲染第一道题，传入category参数
    renderQuestion(0);

    modal.style.display = 'flex';
}
// 渲染指定索引的题目（适配多题切换和图片题）
function renderQuestion(index) {
    // 所有题答完，直接返回
    if (index >= state.currentQuestions.length) return;

    const question = state.currentQuestions[index];
    const content = document.getElementById('quiz-content');
    
    // 保存当前分类到window，供checkAnswer使用
    // 注意：需要在调用renderQuestion时传入category，或者从其他地方获取
    // 这里我们从state中获取当前分类（需要在showQuizModal中保存）
    const currentCategory = window.currentQuizCategory || 1;
    
    let html = '';

    // 图片题
    if(question.type === 'image'){
        html = `
            <div style="margin-bottom:15px;"><strong>${index + 1}/${state.currentQuestions.length} ${question.title}</strong></div>
            <div style="text-align:center; margin-bottom:15px;">
                <img src="${question.src}" style="max-width:100%; border-radius:8px; cursor:pointer;" 
                     onclick="window.open('${question.src}','_blank')" title="点击放大查看">
            </div>
            <div style="margin:10px 0;">
                <input type="text" id="image-answer-input" placeholder="请输入答案" 
                       style="width:100%; padding:10px; font-size:16px; border:1px solid #ddd; border-radius:4px;">
            </div>
            <button id="submit-image-answer" style="width:100%; padding:10px; background:#28a745; color:white; border:none; border-radius:4px; cursor:pointer;">
                提交答案
            </button>
        `;
    } else {
        // 选择题
        html = `
            <div style="margin-bottom: 15px;"><strong>${index + 1}/${state.currentQuestions.length} ${question.title}</strong></div>
            <div id="options-list">
                ${question.options.map((opt) => `
                    <div class="quiz-option" data-answer="${opt.charAt(0)}" style="margin: 8px 0; cursor: pointer; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        ${opt}
                    </div>
                `).join('')}
            </div>
        `;
    }

    content.innerHTML = html;
    document.getElementById('quiz-hint').style.display = 'none';
    document.getElementById('quiz-result').style.display = 'none';
    document.getElementById('quiz-close').style.display = 'none';

    // 选择题绑定
    if(!question.type){
        const options = document.querySelectorAll('.quiz-option');
        options.forEach(option => {
            option.addEventListener('click', () => {
                const userAnswer = option.getAttribute('data-answer');
                checkAnswer(index, userAnswer);
            });
        });
    } else {
        // 图片题提交绑定
        document.getElementById('submit-image-answer').addEventListener('click', () => {
            const input = document.getElementById('image-answer-input');
            const userAnswer = input.value.trim();
            checkAnswer(index, userAnswer);
        });
    }
}
// ========== 5. 修复 checkAnswer 函数（补全content变量，避免报错） ==========
function checkAnswer(questionIndex, userAnswer) {
  // ========== 1. 增加调试日志 + 容错处理（关键） ==========
  console.log("【答题调试】当前题索引：", questionIndex);
  console.log("【答题调试】已答题数/总题数：", state.answeredCount, "/", state.currentQuestions.length);
  console.log("【答题调试】用户答案/正确答案：", userAnswer, "/", state.currentQuestions[questionIndex]?.answer);

  // 容错：题目不存在直接返回
  if (!state.currentQuestions[questionIndex]) {
    alert("⚠️ 题目数据异常，请重试！");
    document.getElementById('quiz-modal').style.display = 'none';
    state.isAnswering = false;
    return;
  }

  const question = state.currentQuestions[questionIndex];
  // ========== 2. 所有DOM元素获取加容错（避免报错中断） ==========
  const hintEl = document.getElementById('quiz-hint') || document.createElement('div');
  const resultEl = document.getElementById('quiz-result') || document.createElement('div');
  const remainEl = document.getElementById('quiz-remain') || document.createElement('div');
  const closeBtn = document.getElementById('quiz-close') || document.createElement('button');
  const content = document.getElementById('quiz-content') || document.createElement('div');
  const currentCategory = window.currentQuizCategory || 1;

  if (userAnswer === question.answer) {
    state.answeredCount++;
    hintEl.style.display = 'none';
    resultEl.style.display = 'block';
 // 根据分类显示不同的正确评价语（从预习代码复制）
        if (currentCategory === 2) {
            resultEl.innerText = `✅ 太棒了！你完美掌握了叶片切片实验的核心操作规范：横向切割、双刀速切、保护细胞结构，每一个细节都精准拿捏！不仅能分清方向和工具，还理解了操作背后的原理，实验思维和知识点都超扎实，继续保持这份细致和认真，你就是课堂上最亮眼的实验小能手！`;
        } else if (currentCategory === 1) {
            resultEl.innerText = `✅ 能根据实验要求，正确选用双面刀片，器材选择准确。`;
        } else if (currentCategory === 3) {
            resultEl.innerText = `✅ 你严谨遵守了实验规范，用洁净纱布擦拭载玻片和盖玻片，有效避免了杂质、油污对观察的干扰，细节意识和科学素养超棒，为后续实验打下了干净清晰的基础！`;
        } else if (currentCategory === 4) {
            resultEl.innerText = `✅ 你精准掌握了选取最薄叶片切片的规范操作，用毛笔轻取薄片的方法既专业又能保护切片完整性，实验操作细节拿捏得很到位！`;
        } else if (currentCategory === 5) {
            resultEl.innerText = `✅ 你精准抓住了实验操作的核心逻辑！用镊子夹取盖玻片，既能避免手指污染标本或盖玻片，又能精准控制倾斜角度和放下速度，完美体现了严谨的科学操作素养，细节意识超棒！`;
        } else if (currentCategory === 6) {
            const correctMessages = [
                '你严格遵循了显微镜取放规范，一手握镜壁、一手托镜座的动作既稳又安全，能有效避免显微镜倾斜、滑落损坏，科学操作素养超棒！ “一手握壁、一手托座”，保护好精密仪器哦！',
                '你精准掌握了显微镜取放的操作逻辑！将显微镜放在实验台偏左的位置，既方便左眼观察目镜、右手记录绘图，又能避免仪器滑落，操作习惯既科学又高效，实验素养超棒！'
            ];
            const randomIndex = Math.floor(Math.random() * correctMessages.length);
            resultEl.innerText = `✅ ${correctMessages[randomIndex]}`;
        } else {
            resultEl.innerText = `✅ 回答正确！`;
        }
    if (remainEl) remainEl.innerText = state.currentQuestions.length - state.answeredCount;

    // ========== 3. 确保定时器执行（用箭头函数+验证元素） ==========
    setTimeout(() => {
      // 再次验证：所有题答完
      if (state.answeredCount >= state.currentQuestions.length) {
        console.log("【答题调试】所有题答完，显示完成提示");
        // 确保content存在再修改innerHTML
        if (content) {
          content.innerHTML = `<h4 style="text-align:center; color:#28a745;">🎉 所有${state.currentQuestions.length}道题回答正确！</h4>`;
        }
        resultEl.style.display = 'none';
        // 确保closeBtn存在再显示
        if (closeBtn) {
          closeBtn.style.display = 'block';
          // 修复：绑定关闭事件（确保能关闭弹窗）
          closeBtn.onclick = () => {
            const modal = document.getElementById('quiz-modal');
            if (modal) modal.style.display = 'none';
            state.isAnswering = false;
            state.currentQuestions = []; // 彻底清空
            state.answeredCount = 0;     // 重置答题数
            console.log("【答题调试】弹窗已关闭，状态重置");
          };
        }
      } else {
        console.log("【答题调试】继续下一题，索引：", questionIndex + 1);
        renderQuestion(questionIndex + 1);
      }
    }, 1000);
  } else {
    // 答错提示（确保元素存在）
    if (hintEl) {
      hintEl.style.display = 'block';
        if (currentCategory === 2) {
            const errorMessages = [
                '别灰心！这几道题只是实验操作的细节小考验，哪怕这次没全对也没关系～只要记住 "横向看结构，双刀要速切" 这个小口诀，再对照实验步骤复盘一遍，把方向、工具、动作的易错点理清楚，下次一定能稳稳通关！你对实验的热情和探索欲就是最大的优势，慢慢来，每一次尝试都在靠近满分！',
                '使用并排两片刀片可获得更薄的切片，横向切割能观察到叶片横切面结构，迅速切割能保证切片薄而完整，避免细胞结构被破坏；缓慢切割易使叶片组织挤压、变形，切片过厚；来回切拉会造成切片破碎破坏结构，无法得到完整切片；应使用捏紧并排的双面刀片，并迅速切割，以获得薄而均匀的切片。'
            ];
            const randomIndex = Math.floor(Math.random() * errorMessages.length);
            hintEl.innerText = `❌ ${errorMessages[randomIndex]}`;
        } else if (currentCategory === 1) {
            hintEl.innerText = '❌ 未正确选取实验所需的双面刀片，错误选用单面刀片，实验器材选择不符合要求。';
        } else if (currentCategory === 3) {
            hintEl.innerText = '❌ 这次小疏忽啦～忘记用纱布擦拭玻片会残留杂质，容易在显微镜下形成干扰，影响对叶片结构的观察。下次记得先 "擦净玻片再操作"，实验效果会更好哦！';
        } else if (currentCategory === 4) {
            hintEl.innerText = '❌ 没关系！这次只是对工具选择有点混淆，记住要用毛笔轻轻蘸取最薄的切片，避免用手或镊子夹碎切片，下次一定能选对！';
        } else if (currentCategory === 5) {
            hintEl.innerText = '❌ 没关系！这次只是对操作原理的理解有点偏差，记住用镊子的核心目的：防止手指污染、保证操作精准、避免盖玻片碎裂或产生气泡，下次就能清晰理解啦！';
        } else if (currentCategory === 6) {
            const errorMessages = [
                '这次小疏忽啦～取放显微镜时只握镜壁会导致仪器重心不稳，容易磕碰甚至摔落损坏，下次一定要记得 “一手握壁、一手托座”，保护好精密仪器哦！',
                '没关系！这次只是对操作原理的理解有偏差，记住显微镜放偏左的核心目的：方便左眼观察、右手记录，同时保证仪器稳定安全，下次就能清晰理解啦！'
            ];
            const randomIndex = Math.floor(Math.random() * errorMessages.length);
            hintEl.innerText = `❌ ${errorMessages[randomIndex]}`;
        } else {
            hintEl.innerText = '❌ 答案错误，请重新选择！';
        }
      hintEl.style.color = '#dc3545';
      hintEl.style.textAlign = 'center';
    }
  }
}
// 禁用实验操作的拦截函数（放在handleExperimentLogic开头）
function checkAnsweringState() {
  if (state.isAnswering) {
    addLog("⚠️ 请先完成答题纠错，再继续实验！");
    return true; // 正在答题，拦截操作
  }
  return false; // 可正常操作
}
    // 9. 重新开始/关闭弹窗
  restartBtn.onclick = () => {
    // 重置所有状态（可选，也可直接刷新页面）
    state.hasDish = false;
    document.getElementById('dip-water-dish').classList.add('hidden');
    window.location.reload();
};
    closeReportBtn.onclick = () => document.getElementById('report-modal').style.display = 'none';

    // ========== 修复点2：初始化时确保器材架默认隐藏（双重保险） ==========
    shelf.style.display = 'none';
    initToolClickListeners();
    // ========== 接收显微镜页面扣分信息 ==========
// 方法1：使用 window.addEventListener 监听 message 事件
window.addEventListener('message', function(event) {
    // 安全检查：确保消息来自显微镜页面
    if (event.data && event.data.type === 'microscope-deduction') {
        // 更新总扣分
        if (!state.totalDeduction) state.totalDeduction = 0;
        state.totalDeduction += event.data.points;
        
        // 记录扣分详情
        if (!state.details) state.details = [];
        state.details.push(`显微镜操作：${event.data.reason} (-${event.data.points}分)`);
        
        // 显示日志
        addLog(`⚠️ 收到显微镜扣分：${event.data.reason} (-${event.data.points}分)`);
        
        // 如果扣分超过阈值，触发答题
        if (event.data.points >= 0.5) {
            handleErrorWithVideo('duiguang.mp4', '显微镜对光调光操作教学', 6); // 先弹视频
        }
    }
});

// 方法2：使用 localStorage 监听（备选方案）
window.addEventListener('storage', function(e) {
    if (e.key === 'microscopeDeduction') {
        try {
            const data = JSON.parse(e.newValue);
            if (data && data.points) {
                // 更新总扣分
                if (!state.totalDeduction) state.totalDeduction = 0;
                state.totalDeduction += data.points;
                
                // 记录扣分详情
                if (!state.details) state.details = [];
                state.details.push(`显微镜操作：${data.reason} (-${data.points}分)`);
                
                // 显示日志
                addLog(`⚠️ 收到显微镜扣分：${data.reason} (-${data.points}分)`);
            }
        } catch (err) {
            console.error('解析扣分数据失败', err);
        }
    }
});

// ========== 可选：添加一个按钮来打开显微镜页面 ==========
// 在右侧控制面板添加一个按钮（如果还没有的话）
function addMicroscopeButton() {
    const controlsPanel = document.querySelector('.controls');
    if (controlsPanel) {
        const microPanel = document.createElement('div');
        microPanel.className = 'panel';
        microPanel.innerHTML = `
            <h3>🔬 显微镜操作</h3>
            <button class="btn-blue" id="openMicroscopeBtn">打开显微镜页面</button>
            <div class="step-status" id="micro-status">⏳ 未开始</div>
        `;
        controlsPanel.appendChild(microPanel);
        
        document.getElementById('openMicroscopeBtn').onclick = () => {
            // 打开显微镜页面
            window.open('xinweijing.html', '_blank');
            addLog("🔬 已打开显微镜操作页面");
        };
    }
}

// 调用添加按钮（可选）
setTimeout(addMicroscopeButton, 1000);

// ========== 修改评分计算，包含显微镜扣分 ==========
// 在原有的 tidyBtn 点击事件中，确保计算总分时包含显微镜扣分
const originalTidyBtn = document.getElementById('tidyBtn').onclick;
document.getElementById('tidyBtn').onclick = function() {
    // 最终总分 = 满分5分 - 总扣分数（包含显微镜扣分）
    const total = Math.max(0, 5 - (state.totalDeduction || 0));
    document.getElementById('finalScore').innerText = total.toFixed(1) + " 分";
    
    // 显示扣分详情（包含显微镜扣分）
    const detailsHtml = state.details && state.details.length > 0 ? 
        "扣分详情：<br>" + state.details.join('<br>') : "🎉 表现完美，满分！";
    document.getElementById('scoreDetails').innerHTML = detailsHtml;
    
    document.getElementById('report-modal').style.display = 'flex';
    
    // 如果原有函数存在，也调用它
    if (originalTidyBtn) originalTidyBtn.call(this);
};
});
