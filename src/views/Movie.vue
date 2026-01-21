<template>
<div>
  <el-form :inline="true" :model="queryParam">
    <el-form-item label="电影名称">
      <el-input size="small" v-model="queryParam.name" width="370px" />
    </el-form-item>
    <el-form-item label="电影类型">
      <el-select size="small" v-model="queryParam.typeId" filterable clearable width="370px">
        <el-option v-for="item in movieTypeList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="导演">
      <el-input size="small" v-model="queryParam.director" width="370px" />
    </el-form-item>
    <el-form-item>
      <el-button size="small" type="primary" icon="el-icon-search" @click="getList">搜索</el-button>
      <el-button size="small" type="success" icon="el-icon-plus" @click="toSave({})">新增</el-button>
    </el-form-item>
  </el-form>
  <el-table :data="tableData" border style="width: 100%">
    <el-table-column prop="name" label="电影名称" align="center" />
    <el-table-column prop="type.name" label="电影类型" align="center" />
    <el-table-column prop="length" label="时长(分钟)" align="center" />
    <el-table-column label="海报" align="center">
      <template slot-scope="scope">
        <img :src="'http://localhost:8080/api/files/' + scope.row.imgUrl" style="width: 50px; height: 50px;"/>
      </template>
    </el-table-column>
    <el-table-column prop="previewName" label="预告片" align="center">
      <template slot-scope="scope">
        <span v-if="scope.row.previewUrl" style="color: blue; cursor: pointer" @click="toPlay(scope.row)">点击预览</span>
      </template>
    </el-table-column>
    <el-table-column prop="actor" label="演员阵容" align="center" />
    <el-table-column prop="director" label="导演" align="center" />
    <el-table-column prop="upDate" label="上映日期" align="center" />
    <el-table-column label="操作">
      <template slot-scope="scope">
        <el-button size="mini" type="primary" @click="toSave(scope.row)"><i class="el-icon-edit" />编辑</el-button>
        <el-button size="mini" type="danger" @click="toDelete(scope.row)"><i class="el-icon-delete" />删除</el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
      style="margin-top: 20px"
      @current-change="handleCurrentChange"
      :total="totalItems"
      layout="total, prev, pager, next"
      :pageSize="10"
      :currentPage="queryParam.current"
  ></el-pagination>
  <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="editDialogFlag" title="编辑电影" width="600px" top="10px">
    <el-form ref="saveForm" inline :model="saveForm" :rules="rules" size="small" label-width="120px">
      <el-form-item label="电影名称" prop="name">
        <el-input size="small" v-model="saveForm.name" style="width: 400px" />
      </el-form-item>
      <el-form-item label="电影类型" prop="typeId">
        <el-select v-model="saveForm.typeId" filterable clearable style="width: 400px">
          <el-option v-for="item in movieTypeList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="时长(分钟)" prop="length">
        <el-input-number size="small" v-model="saveForm.length" style="width: 400px" :min="0" />
      </el-form-item>
      <el-form-item label="海报" prop="imgUrl">
        <el-upload
            style="width: 400px"
            class="avatar-uploader"
            action="http://localhost:8080/api/file/upload"
            :show-file-list="false"
            :on-success="imgSuccess"
        >
          <img v-if="saveForm.imgUrl" :src="'http://localhost:8080/api/files/' + saveForm.imgUrl" class="avatar"/>
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      </el-form-item>
      <el-form-item label="预告片" prop="previewUrl">
        <el-upload
            style="width: 400px"
            action="http://localhost:8080/api/file/upload"
            :limit="1"
            :on-exceed="handleExceed"
            :on-remove="previewRemove"
            :on-success="previewSuccess"
        >
          <el-button size="small" type="primary">点击上传</el-button>
        </el-upload>
      </el-form-item>
      <el-form-item label="电影简介" prop="description">
        <el-input type="textarea" rows="5" size="small" v-model="saveForm.description" style="width: 400px" />
      </el-form-item>
      <el-form-item label="演员阵容" prop="actor">
        <el-input size="small" v-model="saveForm.actor" style="width: 400px" />
      </el-form-item>
      <el-form-item label="导演" prop="director">
        <el-input size="small" v-model="saveForm.director" style="width: 400px" />
      </el-form-item>
      <el-form-item label="上映日期" prop="upDate">
        <el-date-picker size="small" format="yyyy-MM-dd" value-format="yyyy-MM-dd" v-model="saveForm.upDate" style="width: 400px" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="editDialogFlag = false">取消</el-button>
      <el-button :loading="editLoading" type="primary" @click="save">确认</el-button>
    </div>
  </el-dialog>
  <!-- 播放表单 -->
  <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="videoPlayFlag" v-if="videoPlayFlag" title="预告片" width="70%" top="10px" @close="beforeClose">
    <video ref="video" width="100%" height="100%" controls>
      <source :src="'http://localhost:8080/api/files/' + saveForm.previewUrl" type="video/mp4">
    </video>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="videoPlayFlag = false">取消</el-button>
    </div>
  </el-dialog>
</div>
</template>

<script>
import {downloadFile} from "@/utils/download";
export default {
  data() {
    return {
      tableData: [],
      totalItems: null,
      queryParam: {
        current: 1,
      },
      saveForm: {},
      movieTypeList: [],
      editLoading: false,
      editDialogFlag: false,
      videoPlayFlag: false,
      rules: {
        name: [
          { required: true, message: '电影名称不能为空', trigger: 'change' }
        ],
        typeId: [
          { required: true, message: '电影类型不能为空', trigger: 'change' }
        ],
        length: [
          { required: true, message: '时长不能为空', trigger: 'change' }
        ],
        imgUrl: [
          { required: true, message: '海报不能为空', trigger: 'change' }
        ],
        description: [
          { required: true, message: '电影简介不能为空', trigger: 'change' }
        ],
        actor: [
          { required: true, message: '演员阵容不能为空', trigger: 'change' }
        ],
        director: [
          { required: true, message: '导演不能为空', trigger: 'change' }
        ],
        upDate: [
          { required: true, message: '上映日期不能为空', trigger: 'change' }
        ],
      },
      loginer: {},
      isPlay: false,
      playerOptions: {
        // playbackRates: [0.5, 1.0, 1.5, 2.0], // 可选的播放速度
        autoplay: false,  // 如果为true,浏览器准备好时开始回放
        muted: false,     // 默认情况下将会消除任何音频。
        loop: false,      // 是否视频一结束就重新开始。
        playsinline: false,
        progressBar: false,
        preload: 'auto',  // 建议浏览器在<video>加载元素后是否应该开始下载视频数据。auto浏览器选择最佳行为,立即开始加载视频（如果浏览器支持）
        language: 'zh-CN',
        aspectRatio: '16:9',  // 将播放器置于流畅模式，并在计算播放器的动态大小时使用该值。值应该代表一个比例 - 用冒号分隔的两个数字（例如"16:9"或"4:3"）
        fluid: true,  // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        sources: [{
          type: "video/mp4",  // 类型
        }],
        poster: '',  // 封面地址
        notSupportedMessage: '此视频暂无法播放，请稍后再试',  // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
        controlBar: {
          timeDivider: false,           // 当前时间和持续时间的分隔符
          durationDisplay: false,       // 显示持续时间
          remainingTimeDisplay: false, // 是否显示剩余时间功能
          fullscreenToggle: true,       // 是否显示全屏按钮
          currentTimeDisplay: false,   // 当前时间
          playToggle: true,       // 播放按钮
          volumePanel: false       // 静音按钮
        }
      }
    }
  },

  created() {
    this.getList()
    this.$axios({
      url: '/api/loginer',
      method: 'get',
    }).then(res => {
      this.loginer = res.data.data || {}
    })
    this.$axios({
      url: '/api/movie-type/query',
      method: 'post',
      data: {}
    }).then(res => {
      this.movieTypeList = res.data.data
    })
  },

  methods: {
    handleCurrentChange(page) {
      this.queryParam.current = page
      this.getList()
    },
    getList() {
      this.$axios({
        url: '/api/movie/page',
        method: 'post',
        data: this.queryParam
      }).then(res => {
        this.tableData = res.data.data.records
        this.totalItems = res.data.data.total
      })
    },
    toSave(data) {
      this.saveForm = data
      this.editDialogFlag = true
      this.$nextTick(() => {
        this.$refs.saveForm.clearValidate()
      })
    },
    save() {
      this.$refs.saveForm.validate(res => {
        if (res) {
          this.$axios({
            url: this.saveForm.id ? '/api/movie/update': '/api/movie/add',
            method: 'post',
            data: this.saveForm
          }).then(res => {
            if (res.data.code === 0) {
              this.$message.success('保存成功');
              this.editDialogFlag = false
              this.getList()
            } else {
              this.$message.error(res.data.msg);
            }
          })
        }
      })
    },
    toPlay(row) {
      this.saveForm = row
      this.videoPlayFlag = true
    },
    toDelete(row) {
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$axios({
          url: '/api/movie/delete?id=' + row.id,
          method: 'delete'
        }).then(res => {
          if (res.data.code === 0) {
            this.$message.success('删除成功');
            this.getList()
          } else {
            this.$message.error(res.data.msg);
          }
        })
      }).catch(e => {})
    },
    downloadAttach(url, name) {
      downloadFile(url, name)
    },
    imgSuccess(res, file) {
      this.$set(this.saveForm, 'imgUrl', res.data)
      this.saveForm.imgName = file.name
    },
    imgRemove(res, file) {
      this.saveForm.imgUrl = null
      this.saveForm.imgName = null
    },
    previewSuccess(res, file) {
      this.$set(this.saveForm, 'previewUrl', res.data)
      this.saveForm.previewName = file.name
    },
    previewRemove(res, file) {
      this.saveForm.previewUrl = null
      this.saveForm.previewName = null
    },
    handleExceed(files, fileList) {
      this.$message.error('最多只能上传一个文件');
    },
    beforeClose() {
      this.$refs.video.pause()
      this.$refs.video.currentTime = 0
    },
  }
}
</script>
<style scoped>
.avatar {
  display: inline-block;
  width: 200px;
  height: 200px;
  float: right;
}
</style>
