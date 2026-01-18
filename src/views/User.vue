<template>
<div>
  <el-form :inline="true" :model="queryParam">
    <el-form-item label="姓名">
      <el-input size="small" v-model="queryParam.name" width="370px" />
    </el-form-item>
    <el-form-item label="性别">
      <el-select size="small" v-model="queryParam.sex" filterable clearable width="370px">
        <el-option key="男" label="男" value="男" />
        <el-option key="女" label="女" value="女" />
        </el-select>
    </el-form-item>
    <el-form-item>
      <el-button size="small" type="primary" icon="el-icon-search" @click="getList">搜索</el-button>
      <el-button size="small" type="success" icon="el-icon-plus" @click="toSave({})">新增</el-button>
    </el-form-item>
  </el-form>
  <el-table :data="tableData" border style="width: 100%">
    <el-table-column prop="name" label="姓名" align="center" />
    <el-table-column prop="sex" label="性别" align="center" />
    <el-table-column prop="birthday" label="生日" align="center" />
    <el-table-column label="头像" align="center">
      <template slot-scope="scope">
        <img :src="'http://localhost:8080/api/files/' + scope.row.imgUrl" style="width: 50px; height: 50px;"/>
      </template>
    </el-table-column>
    <el-table-column prop="signature" label="个性签名" align="center" />
    <el-table-column prop="phone" label="联系方式" align="center" />
    <el-table-column prop="address" label="常住地" align="center" />
    <el-table-column prop="account" label="登录账号" align="center" />
    <el-table-column prop="password" label="登录密码" align="center" />
    <el-table-column prop="createTime" label="注册时间" align="center" width="180px" />
    <el-table-column label="操作" width="180px">
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
  <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="editDialogFlag" title="编辑用户" width="600px" top="10px">
    <el-form ref="saveForm" inline :model="saveForm" :rules="rules" size="small" label-width="120px">
      <el-form-item label="姓名" prop="name">
        <el-input size="small" v-model="saveForm.name" style="width: 400px" />
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-select v-model="saveForm.sex" filterable clearable style="width: 400px">
          <el-option key="男" label="男" value="男" />
          <el-option key="女" label="女" value="女" />
        </el-select>
      </el-form-item>
      <el-form-item label="生日" prop="birthday">
        <el-date-picker size="small" format="yyyy-MM-dd" value-format="yyyy-MM-dd" v-model="saveForm.birthday" style="width: 400px" />
      </el-form-item>
      <el-form-item label="头像" prop="imgUrl">
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
      <el-form-item label="个性签名" prop="signature">
        <el-input size="small" v-model="saveForm.signature" style="width: 400px" />
      </el-form-item>
      <el-form-item label="联系方式" prop="phone">
        <el-input size="small" v-model="saveForm.phone" style="width: 400px" />
      </el-form-item>
      <el-form-item label="常住地" prop="address">
        <el-input size="small" v-model="saveForm.address" style="width: 400px" />
      </el-form-item>
      <el-form-item label="登录账号" prop="account">
        <el-input size="small" v-model="saveForm.account" style="width: 400px" />
      </el-form-item>
      <el-form-item label="登录密码" prop="password">
        <el-input size="small" v-model="saveForm.password" style="width: 400px" />
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
      editLoading: false,
      editDialogFlag: false,
      rules: {
        name: [
          { required: true, message: '姓名不能为空', trigger: 'change' }
        ],
        sex: [
          { required: true, message: '性别不能为空', trigger: 'change' }
        ],
        birthday: [
          { required: true, message: '生日不能为空', trigger: 'change' }
        ],
        signature: [
          { required: true, message: '个性签名不能为空', trigger: 'change' }
        ],
        phone: [
          { required: true, message: '联系方式不能为空', trigger: 'change' }
        ],
        address: [
          { required: true, message: '常住地不能为空', trigger: 'change' }
        ],
        account: [
          { required: true, message: '登录账号不能为空', trigger: 'change' }
        ],
        password: [
          { required: true, message: '登录密码不能为空', trigger: 'change' }
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
  },

  methods: {
    handleCurrentChange(page) {
      this.queryParam.current = page
      this.getList()
    },
    getList() {
      this.$axios({
        url: '/api/user/page',
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
            url: this.saveForm.id ? '/api/user/update': '/api/user/add',
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
          url: '/api/user/delete?id=' + row.id,
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
