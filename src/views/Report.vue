<template>
<div>
  <el-form :inline="true" :model="queryParam">
    <el-form-item label="投诉原因">
      <el-input size="small" v-model="queryParam.reason" width="370px" />
    </el-form-item>
    <el-form-item label="处理进度">
      <el-select size="small" v-model="queryParam.status" filterable clearable width="370px">
        <el-option key="未处理" label="未处理" value="未处理" />
        <el-option key="已处理" label="已处理" value="已处理" />
        </el-select>
    </el-form-item>
    <el-form-item>
      <el-button size="small" type="primary" icon="el-icon-search" @click="getList">搜索</el-button>
    </el-form-item>
  </el-form>
  <el-table :data="tableData" border style="width: 100%">
    <el-table-column prop="reason" label="投诉原因" align="center" />
    <el-table-column prop="content" label="投诉内容" show-overflow-tooltip align="center" />
    <el-table-column prop="user.name" label="投诉用户" align="center" />
    <el-table-column prop="status" label="处理进度" align="center" />
    <el-table-column prop="handleResult" label="处理结果" align="center" />
    <el-table-column prop="createTime" label="投诉时间" align="center" />
    <el-table-column label="操作">
      <template slot-scope="scope">
        <el-button v-if="scope.row.status === '未处理'" size="mini" type="primary" @click="toSave(scope.row)"><i class="el-icon-edit" />处理</el-button>
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
  <el-dialog append-to-body :close-on-click-modal="false" :visible.sync="editDialogFlag" title="编辑投诉" width="600px">
    <el-form ref="saveForm" inline :model="saveForm" :rules="rules" size="small" label-width="120px">
      <el-form-item label="处理结果" prop="handleResult">
        <el-input size="small" v-model="saveForm.handleResult" style="width: 400px" />
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
      editLoading: false,
      editDialogFlag: false,
      rules: {
        reason: [
          { required: true, message: '投诉原因不能为空', trigger: 'change' }
        ],
        content: [
          { required: true, message: '投诉内容不能为空', trigger: 'change' }
        ],
        userId: [
          { required: true, message: '投诉用户不能为空', trigger: 'change' }
        ],
        status: [
          { required: true, message: '处理进度不能为空', trigger: 'change' }
        ],
        handleResult: [
          { required: true, message: '处理结果不能为空', trigger: 'change' }
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
  },

  methods: {
    handleCurrentChange(page) {
      this.queryParam.current = page
      this.getList()
    },
    getList() {
      this.$axios({
        url: '/api/report/page',
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
          this.saveForm.status = '已处理'
          this.$axios({
            url: '/api/report/update',
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
          url: '/api/report/delete?id=' + row.id,
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
