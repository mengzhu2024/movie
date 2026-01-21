<template>
<div>
  <el-form :inline="true" :model="queryParam">
    <el-form-item label="订单编号">
      <el-select size="small" v-model="queryParam.orderId" filterable clearable width="370px">
        <el-option v-for="item in userOrderList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>
    <el-form-item label="电影">
      <el-input size="small" v-model="queryParam.movieId" width="370px" />
    </el-form-item>
    <el-form-item label="电影名称">
      <el-input size="small" v-model="queryParam.movieName" width="370px" />
    </el-form-item>
    <el-form-item label="电影图片">
      <el-input size="small" v-model="queryParam.imgUrl" width="370px" />
    </el-form-item>
    <el-form-item label="规格">
      <el-input size="small" v-model="queryParam.specificationId" width="370px" />
    </el-form-item>
    <el-form-item label="规格名称">
      <el-input size="small" v-model="queryParam.specificationName" width="370px" />
    </el-form-item>
    <el-form-item label="购买个数">
      <el-input size="small" v-model="queryParam.num" width="370px" />
    </el-form-item>
    <el-form-item label="单价">
      <el-input size="small" v-model="queryParam.price" width="370px" />
    </el-form-item>
    <el-form-item>
      <el-button size="small" type="primary" icon="el-icon-search" @click="getList">搜索</el-button>
      <el-button size="small" type="success" icon="el-icon-plus" @click="toSave({})">新增</el-button>
    </el-form-item>
  </el-form>
  <el-table :data="tableData" border style="width: 100%">
    <el-table-column prop="order.name" label="订单编号" align="center" />
    <el-table-column prop="movieId" label="电影" align="center" />
    <el-table-column prop="movieName" label="电影名称" align="center" />
    <el-table-column label="电影图片" align="center">
      <template slot-scope="scope">
        <img :src="'http://localhost:8080/api/files/' + scope.row.imgUrl" style="width: 50px; height: 50px;"/>
      </template>
    </el-table-column>
    <el-table-column prop="specificationId" label="规格" align="center" />
    <el-table-column prop="specificationName" label="规格名称" align="center" />
    <el-table-column prop="num" label="购买个数" align="center" />
    <el-table-column prop="price" label="单价" align="center" />
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
  <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="editDialogFlag" title="编辑订单详情" width="600px">
    <el-form ref="saveForm" inline :model="saveForm" :rules="rules" size="small" label-width="120px">
      <el-form-item label="订单编号" prop="orderId">
        <el-select v-model="saveForm.orderId" filterable clearable style="width: 400px">
          <el-option v-for="item in userOrderList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="电影" prop="movieId">
        <el-input-number size="small" v-model="saveForm.movieId" style="width: 400px" />
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
      <el-form-item label="规格" prop="specificationId">
        <el-input-number size="small" v-model="saveForm.specificationId" style="width: 400px" />
      </el-form-item>
      <el-form-item label="规格名称" prop="specificationName">
        <el-input size="small" v-model="saveForm.specificationName" style="width: 400px" />
      </el-form-item>
      <el-form-item label="购买个数" prop="num">
        <el-input-number size="small" v-model="saveForm.num" style="width: 400px" />
      </el-form-item>
      <el-form-item label="单价" prop="price">
        <el-input size="small" v-model="saveForm.price" style="width: 400px" />
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
      userOrderList: [],
      editLoading: false,
      editDialogFlag: false,
      rules: {
        orderId: [
          { required: true, message: '订单编号不能为空', trigger: 'change' }
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
        specificationId: [
          { required: true, message: '规格不能为空', trigger: 'change' }
        ],
        specificationName: [
          { required: true, message: '规格名称不能为空', trigger: 'change' }
        ],
        num: [
          { required: true, message: '购买个数不能为空', trigger: 'change' }
        ],
        price: [
          { required: true, message: '单价不能为空', trigger: 'change' }
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
      url: '/api/user-order/query',
      method: 'post',
      data: {}
    }).then(res => {
      this.userOrderList = res.data.data
    })
  },

  methods: {
    handleCurrentChange(page) {
      this.queryParam.current = page
      this.getList()
    },
    getList() {
      this.$axios({
        url: '/api/order-detail/page',
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
            url: this.saveForm.id ? '/api/order-detail/update': '/api/order-detail/add',
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
          url: '/api/order-detail/delete?id=' + row.id,
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
  float: right;
}
</style>
