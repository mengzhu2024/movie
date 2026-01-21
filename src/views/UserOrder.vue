<template>
<div>
  <el-form :inline="true" :model="queryParam">
    <el-form-item label="电影名称">
      <el-input size="small" v-model="queryParam.movieName" width="370px" />
    </el-form-item>
    <el-form-item label="订单状态">
      <el-select size="small" v-model="queryParam.status" filterable clearable width="370px">
        <el-option key="未支付" label="未支付" value="未支付" />
        <el-option key="已支付" label="已支付" value="已支付" />
        </el-select>
    </el-form-item>
    <el-form-item label="支付方式">
      <el-select size="small" v-model="queryParam.payType" filterable clearable width="370px">
        <el-option key="微信" label="微信" value="微信" />
        <el-option key="支付宝" label="支付宝" value="支付宝" />
        <el-option key="银行卡" label="银行卡" value="银行卡" />
        <el-option key="余额" label="余额" value="余额" />
        </el-select>
    </el-form-item>
    <el-form-item>
      <el-button size="small" type="primary" icon="el-icon-search" @click="getList">搜索</el-button>
    </el-form-item>
  </el-form>
  <el-table :data="tableData" border style="width: 100%">
    <el-table-column prop="user.name" label="下单用户" align="center" />
    <el-table-column prop="movieName" label="电影名称" align="center" />
    <el-table-column label="电影图片" align="center">
      <template slot-scope="scope">
        <img :src="'http://localhost:8080/api/files/' + scope.row.imgUrl" style="width: 50px; height: 50px;"/>
      </template>
    </el-table-column>
    <el-table-column prop="session.hallName" label="放映厅" align="center" />
    <el-table-column prop="session.playDate" label="播放日期" align="center" />
    <el-table-column prop="seats" label="购买座位" align="center" />
    <el-table-column prop="price" label="单价" align="center" />
    <el-table-column prop="status" label="订单状态" align="center" />
    <el-table-column prop="payType" label="支付方式" align="center" />
    <el-table-column prop="createTime" label="下单时间" align="center" />
  </el-table>
  <el-pagination
      style="margin-top: 20px"
      @current-change="handleCurrentChange"
      :total="totalItems"
      layout="total, prev, pager, next"
      :pageSize="10"
      :currentPage="queryParam.current"
  ></el-pagination>
  <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="editDialogFlag" title="编辑订单" width="600px">
    <el-form ref="saveForm" inline :model="saveForm" :rules="rules" size="small" label-width="120px">
      <el-form-item label="下单用户" prop="userId">
        <el-select v-model="saveForm.userId" filterable clearable style="width: 400px">
          <el-option v-for="item in userList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="电影" prop="movieId">
        <el-select v-model="saveForm.movieId" filterable clearable style="width: 400px">
          <el-option v-for="item in movieList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="电影名称" prop="movieName">
        <el-input size="small" v-model="saveForm.movieName" style="width: 400px" />
      </el-form-item>
      <el-form-item label="电影图片" prop="imgUrl">
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
      <el-form-item label="电影场次" prop="sessionId">
        <el-select v-model="saveForm.sessionId" filterable clearable style="width: 400px">
          <el-option v-for="item in movieSessionList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="购买座位" prop="seats">
        <el-input size="small" v-model="saveForm.seats" style="width: 400px" />
      </el-form-item>
      <el-form-item label="单价" prop="price">
        <el-input size="small" v-model="saveForm.price" style="width: 400px" />
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select v-model="saveForm.status" filterable clearable style="width: 400px">
          <el-option key="未支付" label="未支付" value="未支付" />
          <el-option key="已支付" label="已支付" value="已支付" />
        </el-select>
      </el-form-item>
      <el-form-item label="支付方式" prop="payType">
        <el-select v-model="saveForm.payType" filterable clearable style="width: 400px">
          <el-option key="微信" label="微信" value="微信" />
          <el-option key="支付宝" label="支付宝" value="支付宝" />
          <el-option key="银行卡" label="银行卡" value="银行卡" />
          <el-option key="余额" label="余额" value="余额" />
        </el-select>
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
      userList: [],
      movieList: [],
      movieSessionList: [],
      editLoading: false,
      editDialogFlag: false,
      rules: {
        userId: [
          { required: true, message: '下单用户不能为空', trigger: 'change' }
        ],
        movieId: [
          { required: true, message: '电影不能为空', trigger: 'change' }
        ],
        movieName: [
          { required: true, message: '电影名称不能为空', trigger: 'change' }
        ],
        imgUrl: [
          { required: true, message: '电影图片不能为空', trigger: 'change' }
        ],
        sessionId: [
          { required: true, message: '电影场次不能为空', trigger: 'change' }
        ],
        seats: [
          { required: true, message: '购买座位不能为空', trigger: 'change' }
        ],
        price: [
          { required: true, message: '单价不能为空', trigger: 'change' }
        ],
        status: [
          { required: true, message: '订单状态不能为空', trigger: 'change' }
        ],
        payType: [
          { required: true, message: '支付方式不能为空', trigger: 'change' }
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
      url: '/api/user/query',
      method: 'post',
      data: {}
    }).then(res => {
      this.userList = res.data.data
    })
    this.$axios({
      url: '/api/movie/query',
      method: 'post',
      data: {}
    }).then(res => {
      this.movieList = res.data.data
    })
    this.$axios({
      url: '/api/movie-session/query',
      method: 'post',
      data: {}
    }).then(res => {
      this.movieSessionList = res.data.data
    })
  },

  methods: {
    handleCurrentChange(page) {
      this.queryParam.current = page
      this.getList()
    },
    getList() {
      this.$axios({
        url: '/api/user-order/page',
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
            url: this.saveForm.id ? '/api/user-order/update': '/api/user-order/add',
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
          url: '/api/user-order/delete?id=' + row.id,
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
