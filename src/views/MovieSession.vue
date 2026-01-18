<template>
<div>
  <el-form :inline="true" :model="queryParam">
    <el-form-item label="影厅">
      <el-select size="small" v-model="queryParam.hallId" filterable clearable width="370px">
        <el-option v-for="item in movieHallList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="电影">
      <el-select size="small" v-model="queryParam.movieId" filterable clearable width="370px">
        <el-option v-for="item in movieList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button size="small" type="primary" icon="el-icon-search" @click="getList">搜索</el-button>
      <el-button size="small" type="success" icon="el-icon-plus" @click="toSave({})">新增</el-button>
    </el-form-item>
  </el-form>
  <el-table :data="tableData" border style="width: 100%">
    <el-table-column prop="hall.name" label="影厅" align="center" />
    <el-table-column prop="movie.name" label="电影" align="center" />
    <el-table-column prop="playDate" label="播放日期" align="center" />
    <el-table-column prop="playTime" label="播放时间" align="center" />
    <el-table-column prop="endTime" label="散场时间" align="center" />
    <el-table-column prop="price" label="票价" align="center" />
    <el-table-column prop="seatNums" label="总座位数" align="center" />
    <el-table-column prop="sallNums" label="售出座位数" align="center" />
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
  <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="editDialogFlag" title="编辑场次" width="600px" top="5px">
    <el-form ref="saveForm" inline :model="saveForm" :rules="rules" size="small" label-width="120px">
      <el-form-item v-if="!saveForm.id" label="影厅" prop="hallId">
        <el-select v-model="saveForm.hallId" filterable clearable style="width: 400px" @change="hallChange">
          <el-option v-for="item in movieHallList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="!saveForm.id" label="电影" prop="movieId">
        <el-select v-model="saveForm.movieId" filterable clearable style="width: 400px" @change="movieChange">
          <el-option v-for="item in movieList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="!saveForm.id" label="播放日期" prop="playDate">
        <el-date-picker size="small" format="yyyy-MM-dd" value-format="yyyy-MM-dd" v-model="saveForm.playDate" style="width: 400px" />
      </el-form-item>
      <el-form-item v-if="!saveForm.id" label="播放时间" prop="playTime">
        <el-time-picker
            v-model="saveForm.playTime"
            format="HH:mm:ss" value-format="HH:mm:ss"
            placeholder="请选择播放时间"
            style="width: 400px">
        </el-time-picker>
      </el-form-item>
      <el-form-item label="票价" prop="price">
        <el-input-number size="small" v-model="saveForm.price" style="width: 400px" :precision="2" />
      </el-form-item>
      <el-form-item label="影厅提示" prop="tips">
        <el-input type="textarea" rows="5" size="small" v-model="saveForm.tips" style="width: 400px" />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="editDialogFlag = false">取消</el-button>
      <el-button :loading="editLoading" type="primary" @click="save">确认</el-button>
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
      movieHallList: [],
      movieList: [],
      editLoading: false,
      editDialogFlag: false,
      rules: {
        hallId: [
          { required: true, message: '影厅不能为空', trigger: 'change' }
        ],
        movieId: [
          { required: true, message: '电影不能为空', trigger: 'change' }
        ],
        playTime: [
          { required: true, message: '播放时间不能为空', trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '散场时间不能为空', trigger: 'change' }
        ],
        playDate: [
          { required: true, message: '播放日期不能为空', trigger: 'change' }
        ],
        price: [
          { required: true, message: '票价不能为空', trigger: 'change' }
        ],
      },
      loginer: {}
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
      url: '/api/movie-hall/query',
      method: 'post',
      data: {}
    }).then(res => {
      this.movieHallList = res.data.data
    })
    this.$axios({
      url: '/api/movie/query',
      method: 'post',
      data: {}
    }).then(res => {
      this.movieList = res.data.data
    })
  },

  methods: {
    hallChange(val) {
      this.saveForm.hall = this.movieHallList.filter(e => e.id === val)[0]
    },
    movieChange(val) {
      this.saveForm.movie = this.movieList.filter(e => e.id === val)[0]
    },
    handleCurrentChange(page) {
      this.queryParam.current = page
      this.getList()
    },
    getList() {
      this.$axios({
        url: '/api/movie-session/page',
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
            url: this.saveForm.id ? '/api/movie-session/update': '/api/movie-session/add',
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
    toDelete(row) {
      this.$confirm('确定删除吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$axios({
          url: '/api/movie-session/delete?id=' + row.id,
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
    handleExceed(files, fileList) {
      this.$message.error('最多只能上传一个文件');
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
